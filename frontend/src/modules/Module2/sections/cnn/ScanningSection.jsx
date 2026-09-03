import { useEffect, useRef, useState } from 'react'
import butterflyImage from '../../../../assets/module2/cnn/butterfly-original.png'
import {
  DEFAULT_KERNEL,
  KERNEL_PRESETS,
  KERNEL_SIZE,
  OUTPUT_SIZE,
  PADDED_SIZE,
  PADDING,
  SAMPLE_IMAGE,
  SOURCE_SIZE,
  STRIDE,
  computeWeightedSum,
  getReceptiveFieldValues,
  padImageGrid,
} from '../../module2Config'
import {
  applyBoxBlurPerChannel,
  applyConvolution,
  applyConvolutionPerChannel,
  toGrayscale,
} from '../../utils/imageProcessing'
import { useT } from '../../../../i18n/useT'

const SVG_W = 1260
const SVG_H = 500
const EDGE_IMAGE_WIDTH = 1474
const EDGE_IMAGE_HEIGHT = 1067
const EDGE_IMAGE_ASPECT_RATIO = `${EDGE_IMAGE_WIDTH} / ${EDGE_IMAGE_HEIGHT}`
const EMPTY_EDGE_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${EDGE_IMAGE_WIDTH}' height='${EDGE_IMAGE_HEIGHT}' viewBox='0 0 ${EDGE_IMAGE_WIDTH} ${EDGE_IMAGE_HEIGHT}'%3E%3Crect width='${EDGE_IMAGE_WIDTH}' height='${EDGE_IMAGE_HEIGHT}' fill='%23020617'/%3E%3C/svg%3E`
const BLUR_RADIUS = 7

const EDGE_FILTERS = {
  vertical: {
    kernel: [-1, 0, 1, -1, 0, 1, -1, 0, 1],
    caption: 'Vertical kernel — picks up vertical lines',
    alt: 'Vertical edge filter output for the butterfly.',
  },
  horizontal: {
    kernel: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
    caption: 'Horizontal kernel — picks up horizontal lines',
    alt: 'Horizontal edge filter output for the butterfly.',
  },
  sharpen: {
    kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    caption: 'Sharpen kernel — boosts contrast at edges',
    alt: 'Sharpen filter output for the butterfly.',
  },
  blur: {
    kernel: [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9],
    caption: 'Blur kernel — averages neighboring pixels, softens detail',
    alt: 'Blur filter output for the butterfly.',
  },
}

const EDGE_PRESET_BY_KERNEL = {
  verticalEdge: 'vertical',
  horizontalEdge: 'horizontal',
  sharpen: 'sharpen',
  blur: 'blur',
}

const edgePanelStyle = {
  background: '#020617',
  border: '1px solid rgba(148, 163, 184, 0.28)',
  borderRadius: 18,
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)',
  display: 'grid',
  gap: 12,
  margin: 0,
  overflow: 'hidden',
  padding: 14,
}

const edgeVisualFrameStyle = {
  aspectRatio: EDGE_IMAGE_ASPECT_RATIO,
  background: '#020617',
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  width: '100%',
}

const edgeVisualStyle = {
  display: 'block',
  height: '100%',
  objectFit: 'contain',
  objectPosition: 'center',
  width: '100%',
}

function getCellTone(value) {
  if (value > 0) {
    return {
      bg: '#3B82F6',
      border: '#2563EB',
      text: '#FFFFFF',
    }
  }

  return {
    bg: '#F8FAFC',
    border: '#CBD5E1',
    text: '#94A3B8',
  }
}

function getOutputTone(value) {
  if (value > 0) {
    const intensity = Math.min(1, value / 6)
    return {
      bg: `rgba(59, 130, 246, ${0.18 + intensity * 0.38})`,
      border: '#7C3AED',
      text: '#4C1D95',
    }
  }

  if (value < 0) {
    const intensity = Math.min(1, Math.abs(value) / 6)
    return {
      bg: `rgba(248, 113, 113, ${0.16 + intensity * 0.34})`,
      border: '#F97316',
      text: '#9A3412',
    }
  }

  return {
    bg: '#F8FAFC',
    border: '#CBD5E1',
    text: '#64748B',
  }
}

function createEdgeImage(sourceImage, filterType) {
  const scratchCanvas = document.createElement('canvas')
  const scratchContext = scratchCanvas.getContext('2d', { willReadFrequently: true })
  const outputCanvas = document.createElement('canvas')
  const outputContext = outputCanvas.getContext('2d')
  const filter = EDGE_FILTERS[filterType]

  if (!scratchContext || !outputContext || !filter) return EMPTY_EDGE_IMAGE

  scratchCanvas.width = EDGE_IMAGE_WIDTH
  scratchCanvas.height = EDGE_IMAGE_HEIGHT
  outputCanvas.width = EDGE_IMAGE_WIDTH
  outputCanvas.height = EDGE_IMAGE_HEIGHT

  scratchContext.fillStyle = '#000000'
  scratchContext.fillRect(0, 0, EDGE_IMAGE_WIDTH, EDGE_IMAGE_HEIGHT)
  scratchContext.drawImage(sourceImage, 0, 0, EDGE_IMAGE_WIDTH, EDGE_IMAGE_HEIGHT)

  const sourceData = scratchContext.getImageData(0, 0, EDGE_IMAGE_WIDTH, EDGE_IMAGE_HEIGHT)
  let edgeData

  if (filterType === 'vertical' || filterType === 'horizontal') {
    edgeData = applyConvolution(toGrayscale(sourceData), EDGE_IMAGE_WIDTH, EDGE_IMAGE_HEIGHT, filter.kernel)
  } else if (filterType === 'blur') {
    edgeData = applyBoxBlurPerChannel(sourceData, EDGE_IMAGE_WIDTH, EDGE_IMAGE_HEIGHT, BLUR_RADIUS)
  } else if (filterType === 'sharpen') {
    const sharpenedData = applyConvolutionPerChannel(sourceData, EDGE_IMAGE_WIDTH, EDGE_IMAGE_HEIGHT, filter.kernel)
    edgeData = applyConvolutionPerChannel(sharpenedData, EDGE_IMAGE_WIDTH, EDGE_IMAGE_HEIGHT, filter.kernel)
  } else {
    edgeData = applyConvolutionPerChannel(sourceData, EDGE_IMAGE_WIDTH, EDGE_IMAGE_HEIGHT, filter.kernel)
  }

  outputContext.fillStyle = '#000000'
  outputContext.fillRect(0, 0, EDGE_IMAGE_WIDTH, EDGE_IMAGE_HEIGHT)
  outputContext.putImageData(edgeData, 0, 0)

  return outputCanvas.toDataURL('image/png')
}

function EdgeDetectionCards({ activeEdgePreset }) {
  const t = useT()
  const imageRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [edgeImages, setEdgeImages] = useState({})

  useEffect(() => {
    const sourceImage = imageRef.current

    if (!isReady || !sourceImage) return

    setEdgeImages({
      vertical: createEdgeImage(sourceImage, 'vertical'),
      horizontal: createEdgeImage(sourceImage, 'horizontal'),
      sharpen: createEdgeImage(sourceImage, 'sharpen'),
      blur: createEdgeImage(sourceImage, 'blur'),
    })
  }, [isReady])

  const activeFilter = activeEdgePreset ? EDGE_FILTERS[activeEdgePreset] : null
  const activeImage = activeEdgePreset ? edgeImages[activeEdgePreset] ?? EMPTY_EDGE_IMAGE : null

  return (
    <div
      style={{
        display: 'grid',
        gap: 18,
        gridTemplateColumns: activeFilter ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, min(100%, 520px))',
        justifyContent: activeFilter ? 'stretch' : 'center',
      }}
    >
      <figure style={edgePanelStyle}>
        <div style={edgeVisualFrameStyle}>
          <img
            ref={imageRef}
            src={butterflyImage}
            alt={t('module2.cnn.originalButterflyAlt')}
            onLoad={() => setIsReady(true)}
            style={edgeVisualStyle}
          />
        </div>
        <figcaption style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700 }}>
          {t('module2.cnn.originalLabel')}
        </figcaption>
      </figure>

      {activeFilter && (
        <figure style={edgePanelStyle}>
          <div style={edgeVisualFrameStyle}>
            <img
              src={activeImage}
              alt={activeFilter.alt}
              style={edgeVisualStyle}
            />
          </div>
          <figcaption style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, lineHeight: 1.5 }}>
            {t(`module2.cnn.edge.${activeEdgePreset}`)}
          </figcaption>
        </figure>
      )}
    </div>
  )
}

function ScanningSection() {
  const t = useT()
  const [convImage, setConvImage] = useState([...SAMPLE_IMAGE])
  const [kernel, setKernel] = useState([...DEFAULT_KERNEL])
  const [receptiveFieldPos, setReceptiveFieldPos] = useState({ row: 0, col: 0 })
  const [storedOutputs, setStoredOutputs] = useState(() => {
    const initialPaddedImage = padImageGrid(SAMPLE_IMAGE, SOURCE_SIZE, PADDING)
    const initialField = getReceptiveFieldValues(initialPaddedImage, 0, 0, PADDED_SIZE)
    const initialSum = computeWeightedSum(initialField, DEFAULT_KERNEL)
    return { '0,0': initialSum }
  })
  const [isAnimating, setIsAnimating] = useState(false)
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false)
  const [activeEdgePreset, setActiveEdgePreset] = useState(null)

  const paddedImage = padImageGrid(convImage, SOURCE_SIZE, PADDING)

  const currentField = getReceptiveFieldValues(
    paddedImage,
    receptiveFieldPos.row,
    receptiveFieldPos.col,
    PADDED_SIZE
  )
  const convSum = computeWeightedSum(currentField, kernel)
  const scoreParts = currentField.map((val, i) => ({ input: val, weight: kernel[i], product: val * kernel[i] }))

  const updateStoredValue = (image, nextKernel, row, col, resetMap = false) => {
    const posKey = `${row},${col}`
    const field = getReceptiveFieldValues(image, row, col, PADDED_SIZE)
    const sum = computeWeightedSum(field, nextKernel)
    setStoredOutputs(prev => (resetMap ? { [posKey]: sum } : { ...prev, [posKey]: sum }))
  }

  const toggleConvCell = (index) => {
    const img = [...convImage]
    img[index] = img[index] === 0 ? 1 : 0
    setConvImage(img)
    const padded = padImageGrid(img, SOURCE_SIZE, PADDING)
    updateStoredValue(padded, kernel, receptiveFieldPos.row, receptiveFieldPos.col, true)
  }

  const updateKernelValue = (index, delta) => {
    const nextKernel = [...kernel]
    nextKernel[index] = Math.max(-9, Math.min(9, nextKernel[index] + delta))
    setKernel(nextKernel)
    updateStoredValue(paddedImage, nextKernel, receptiveFieldPos.row, receptiveFieldPos.col, true)
  }

  const loadKernelPreset = (name) => {
    const preset = KERNEL_PRESETS[name]
    if (!preset) return
    setKernel([...preset])
    setActiveEdgePreset(EDGE_PRESET_BY_KERNEL[name] ?? null)
    updateStoredValue(paddedImage, preset, receptiveFieldPos.row, receptiveFieldPos.col, true)
  }

  const moveReceptiveField = (row, col) => {
    if (row < 0 || row >= OUTPUT_SIZE || col < 0 || col >= OUTPUT_SIZE || isAnimating) return
    setIsAnimating(true)
    setReceptiveFieldPos({ row, col })
    updateStoredValue(paddedImage, kernel, row, col)
    setTimeout(() => setIsAnimating(false), 240)
  }

  const resetConvolution = () => {
    setReceptiveFieldPos({ row: 0, col: 0 })
    setActiveEdgePreset(null)
    const field = getReceptiveFieldValues(paddedImage, 0, 0, PADDED_SIZE)
    const sum = computeWeightedSum(field, kernel)
    setStoredOutputs({ '0,0': sum })
  }

  const baselineY = 132
  const sourceCell = 58
  const paddedCell = 38
  const kernelCell = 96
  const kernelBox = 54
  const outputCell = 58

  const sourceX = 44
  const paddedX = 324
  const kernelX = 648
  const outputX = 1060

  const sourceY = baselineY + (PADDED_SIZE * paddedCell - SOURCE_SIZE * sourceCell) / 2
  const paddedY = baselineY
  const kernelY = baselineY + (PADDED_SIZE * paddedCell - KERNEL_SIZE * kernelCell) / 2
  const outputY = baselineY + (PADDED_SIZE * paddedCell - OUTPUT_SIZE * outputCell) / 2

  const paddedWindowX = paddedX + receptiveFieldPos.col * paddedCell - 4
  const paddedWindowY = paddedY + receptiveFieldPos.row * paddedCell - 4
  const paddedWindowSize = KERNEL_SIZE * paddedCell + 8
  const sourceRight = sourceX + SOURCE_SIZE * sourceCell - 4
  const paddedCenterX = paddedX + paddedCell * 2.5
  const sourceToPaddedMidX = (sourceRight + paddedX) / 2
  const paddedToKernelMidX = (paddedX + paddedCell * 5 + kernelX) / 2
  const kernelToOutputMidX = (kernelX + kernelCell * 3 + outputX) / 2 - 10
  const sourceNoteY = sourceY + sourceCell * 3 + 30
  const paddedNoteY = paddedY + paddedCell * 5 + 22
  const kernelNoteY = kernelY + kernelCell * 3 + 30
  const outputNoteY = outputY + outputCell * 3 + 30

  const scannedCount = Object.keys(storedOutputs).length

  return (
    <section className="m2-section">
      <div className="m2-section-card m2-cnn-card">
        <div className="m2-section-heading m2-canvas-heading">
          <p className="m2-eyebrow">{t('module2.cnn.eyebrow')}</p>
          <h2>{t('module2.cnn.title')}</h2>
          <p className="m2-section-subtitle">
            {t('module2.cnn.subtitle')}
          </p>
        </div>

        <div className="m2-cnn-copy-grid">
          <div className="m2-cnn-copy-card">
            <strong>{t('module2.cnn.padding')}</strong>
            <p>{t('module2.cnn.paddingBody')}</p>
          </div>
          <div className="m2-cnn-copy-card">
            <strong>{t('module2.cnn.stride')}</strong>
            <p>{t('module2.cnn.strideBody')}</p>
          </div>
          <div className="m2-cnn-copy-card">
            <strong>{t('module2.cnn.kernel')}</strong>
            <p>{t('module2.cnn.kernelBody')}</p>
          </div>
        </div>

        <div className="m2-cnn-legend">
          <span className="m2-cnn-legend-chip m2-cnn-legend-chip--image">{t('module2.cnn.original')}</span>
          <span className="m2-cnn-legend-chip m2-cnn-legend-chip--padding">{t('module2.cnn.padding')}</span>
          <span className="m2-cnn-legend-chip m2-cnn-legend-chip--active">{t('module2.cnn.currentWindow')}</span>
        </div>

        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="m2-svg-block m2-cnn-svg"
        >
          <defs>
            <marker id="m2-cnn-arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
              <path d="M0,0 L10,4 L0,8 Z" fill="#C4B5FD" />
            </marker>
          </defs>

          <g>
            <text x={sourceX + sourceCell * 1.5} y={86} className="m2-cnn-svg-label" textAnchor="middle">
              Original 3x3
            </text>
            {convImage.map((val, i) => {
              const row = Math.floor(i / SOURCE_SIZE)
              const col = i % SOURCE_SIZE
              const x = sourceX + col * sourceCell
              const y = sourceY + row * sourceCell
              const tone = getCellTone(val)

              return (
                <g key={`source-${i}`} style={{ cursor: 'pointer' }} onClick={() => toggleConvCell(i)}>
                  <rect
                    x={x}
                    y={y}
                    width={sourceCell - 4}
                    height={sourceCell - 4}
                    rx={12}
                    fill={tone.bg}
                    stroke="#DDD6FE"
                    strokeWidth={1.4}
                  />
                  <text
                    x={x + (sourceCell - 4) / 2}
                    y={y + (sourceCell - 4) / 2 + 7}
                    textAnchor="middle"
                    className="m2-cnn-svg-value"
                    fill={tone.text}
                  >
                    {val}
                  </text>
                </g>
              )
            })}
            <text x={sourceX + sourceCell * 1.5} y={sourceNoteY} className="m2-cnn-svg-note" textAnchor="middle">
              Click cells to edit the image.
            </text>
          </g>

          <g>
            <text x={paddedCenterX} y={86} className="m2-cnn-svg-label" textAnchor="middle">
              Padded 5x5
            </text>
            {paddedImage.map((val, i) => {
              const row = Math.floor(i / PADDED_SIZE)
              const col = i % PADDED_SIZE
              const x = paddedX + col * paddedCell
              const y = paddedY + row * paddedCell
              const isPadding = row === 0 || row === PADDED_SIZE - 1 || col === 0 || col === PADDED_SIZE - 1
              const inField =
                row >= receptiveFieldPos.row &&
                row < receptiveFieldPos.row + KERNEL_SIZE &&
                col >= receptiveFieldPos.col &&
                col < receptiveFieldPos.col + KERNEL_SIZE

              const tone = isPadding
                ? { bg: '#F5F3FF', border: '#D8B4FE', text: '#8B5CF6' }
                : getCellTone(val)

              return (
                <g key={`padded-${i}`}>
                  <rect
                    x={x}
                    y={y}
                    width={paddedCell - 4}
                    height={paddedCell - 4}
                    rx={10}
                    fill={tone.bg}
                    stroke={inField ? '#7C3AED' : tone.border}
                    strokeWidth={inField ? 2.3 : 1.3}
                  />
                  <text
                    x={x + (paddedCell - 4) / 2}
                    y={y + (paddedCell - 4) / 2 + 5}
                    textAnchor="middle"
                    className="m2-cnn-svg-small-value"
                    fill={tone.text}
                  >
                    {val}
                  </text>
                </g>
              )
            })}
            <rect
              x={paddedWindowX}
              y={paddedWindowY}
              width={paddedWindowSize}
              height={paddedWindowSize}
              rx={16}
              fill="none"
              stroke="#7C3AED"
              strokeWidth="4"
            />
            <text x={paddedCenterX} y={paddedNoteY} className="m2-cnn-svg-note" textAnchor="middle">
              <tspan x={paddedCenterX} dy="0">{t('module2.cnn.paddingNoteOne')}</tspan>
              <tspan x={paddedCenterX} dy="15">{t('module2.cnn.paddingNoteTwo')}</tspan>
            </text>
          </g>

          <path
            d={`M ${sourceRight + 24} ${baselineY + 95} L ${paddedX - 32} ${baselineY + 95}`}
            fill="none"
            stroke="#C4B5FD"
            strokeWidth="2.5"
            markerEnd="url(#m2-cnn-arrowhead)"
          />
          <text x={sourceToPaddedMidX} y={baselineY + 80} className="m2-cnn-svg-step" textAnchor="middle">
            {t('module2.cnn.addPadding')}
          </text>

          <path
            d={`M ${paddedX + paddedCell * 5 + 24} ${baselineY + 95} L ${kernelX - 28} ${baselineY + 95}`}
            fill="none"
            stroke="#C4B5FD"
            strokeWidth="2.5"
            markerEnd="url(#m2-cnn-arrowhead)"
          />
          <text x={paddedToKernelMidX} y={baselineY + 80} className="m2-cnn-svg-step" textAnchor="middle">
            {t('module2.cnn.scanWithFilter')}
          </text>

          <g>
            <text x={kernelX + kernelCell * 1.5} y={74} className="m2-cnn-svg-label" textAnchor="middle">
              {t('module2.cnn.filter')}
            </text>
            {kernel.map((weight, i) => {
              const row = Math.floor(i / KERNEL_SIZE)
              const col = i % KERNEL_SIZE
              const x = kernelX + col * kernelCell
              const y = kernelY + row * kernelCell
              const boxX = x + (kernelCell - kernelBox) / 2
              const boxY = y
              const positive = weight > 0
              const negative = weight < 0

              return (
                <g key={`kernel-${i}`}>
                  <rect
                    x={boxX}
                    y={boxY}
                    width={kernelBox}
                    height={kernelBox}
                    rx={12}
                    fill={positive ? '#EEF2FF' : negative ? '#FFF7ED' : '#FFFFFF'}
                    stroke={positive ? '#A78BFA' : negative ? '#FDBA74' : '#DDD6FE'}
                    strokeWidth="1.5"
                  />
                  <text
                    x={boxX + kernelBox / 2}
                    y={boxY + kernelBox / 2 + 7}
                    textAnchor="middle"
                    className="m2-cnn-svg-value"
                    fill={positive ? '#6D28D9' : negative ? '#C2410C' : '#64748B'}
                  >
                    {weight > 0 ? `+${weight}` : weight}
                  </text>
                  <g transform={`translate(${boxX}, ${y + kernelBox + 14})`}>
                    <g style={{ cursor: 'pointer' }} onClick={() => updateKernelValue(i, 1)}>
                      <rect x={0} y={0} width={kernelBox / 2} height={24} rx={8} className="m2-cnn-svg-mini-box" />
                      <text x={kernelBox / 4} y={16} textAnchor="middle" className="m2-cnn-svg-mini-btn">+</text>
                    </g>
                    <g style={{ cursor: 'pointer' }} onClick={() => updateKernelValue(i, -1)}>
                      <rect x={kernelBox / 2} y={0} width={kernelBox / 2} height={24} rx={8} className="m2-cnn-svg-mini-box" />
                      <text x={kernelBox * 0.75} y={16} textAnchor="middle" className="m2-cnn-svg-mini-btn">-</text>
                    </g>
                    <line x1={kernelBox / 2} y1={4} x2={kernelBox / 2} y2={20} className="m2-cnn-svg-mini-divider" />
                  </g>
                </g>
              )
            })}
            <text x={kernelX + kernelCell * 1.5} y={kernelNoteY} className="m2-cnn-svg-note" textAnchor="middle">
              {t('module2.cnn.sameFilter')}
            </text>
          </g>

          <path
            d={`M ${kernelX + kernelCell * 3 + 16} ${baselineY + 108} L ${outputX - 16} ${baselineY + 108}`}
            fill="none"
            stroke="#C4B5FD"
            strokeWidth="2.5"
            markerEnd="url(#m2-cnn-arrowhead)"
          />
          <text
            x={kernelToOutputMidX}
            y={baselineY + 86}
            className="m2-cnn-svg-step"
            textAnchor="middle"
          >
            {`${t('module2.cnn.stride')} ${STRIDE}`}
          </text>

          <g>
            <text x={outputX + outputCell * 1.5} y={86} className="m2-cnn-svg-label" textAnchor="middle">
              {t('module2.cnn.output')}
            </text>
            {[0, 1, 2].map(row =>
              [0, 1, 2].map(col => {
                const x = outputX + col * outputCell
                const y = outputY + row * outputCell
                const posKey = `${row},${col}`
                const stored = storedOutputs[posKey]
                const hasValue = stored !== undefined
                const isCurrent = row === receptiveFieldPos.row && col === receptiveFieldPos.col
                const tone = hasValue ? getOutputTone(stored) : { bg: '#F8FAFC', border: '#E2E8F0', text: '#CBD5E1' }

                return (
                  <g key={posKey} style={{ cursor: 'pointer' }} onClick={() => moveReceptiveField(row, col)}>
                    <rect
                      x={x}
                      y={y}
                      width={outputCell - 4}
                      height={outputCell - 4}
                      rx={12}
                      fill={tone.bg}
                      stroke={isCurrent ? '#7C3AED' : tone.border}
                      strokeWidth={isCurrent ? 3 : 1.5}
                    />
                    <text
                      x={x + (outputCell - 4) / 2}
                      y={y + (outputCell - 4) / 2 + 7}
                      textAnchor="middle"
                      className="m2-cnn-svg-value"
                      fill={tone.text}
                    >
                      {hasValue ? stored : '?'}
                    </text>
                  </g>
                )
              })
            )}
            <text x={outputX + outputCell * 1.5} y={outputNoteY} className="m2-cnn-svg-note" textAnchor="middle">
              <tspan x={outputX + outputCell * 1.5} dy="0">{t('module2.cnn.moveHint')}</tspan>
            </text>
          </g>
        </svg>

        <div className="m2-preset-row">
          <span className="m2-preset-label">{t('module2.cnn.filterPresets')}</span>
          {Object.keys(KERNEL_PRESETS).map(name => (
            <button key={name} className="m2-preset-btn" onClick={() => loadKernelPreset(name)}>
              {name.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
          <button className="m2-preset-btn" onClick={resetConvolution}>{t('module2.cnn.resetMap')}</button>
        </div>

        <div className="m2-observation m2-observation--purple">
          <p><strong>{t('module2.cnn.paddingObservation')}</strong></p>
        </div>

        <p className="m2-hint">
          {scannedCount >= OUTPUT_SIZE * OUTPUT_SIZE
            ? t('module2.cnn.scannedAll')
            : t('module2.cnn.outputExplanation')}
        </p>

        <div className="m2-cnn-score-panel">
          <button
            type="button"
            className="m2-cnn-score-toggle"
            onClick={() => setShowScoreBreakdown(prev => !prev)}
          >
            {showScoreBreakdown ? t('module2.cnn.hideScoreDetails') : t('module2.cnn.scoreDetails')}
          </button>

          {showScoreBreakdown && (
            <div className="m2-cnn-score-breakdown">
              <div className="m2-cnn-score-copy">
                <h3>{t('module2.cnn.currentPatchScore')}</h3>
                <p>{t('module2.cnn.scoreBody')}</p>
                <p>
                  {t('module2.cnn.scanPosition', { row: receptiveFieldPos.row + 1, col: receptiveFieldPos.col + 1 })} <strong>{convSum}</strong>.
                </p>
              </div>

              <div className="m2-cnn-score-grid-wrap">
                <div>
                  <span className="m2-cnn-score-label">{t('module2.cnn.patch')}</span>
                  <div className="m2-cnn-score-grid">
                    {currentField.map((value, index) => {
                      const tone = getCellTone(value)
                      return (
                        <span key={`patch-${index}`} style={{ background: tone.bg, color: tone.text, borderColor: '#DDD6FE' }}>
                          {value}
                        </span>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <span className="m2-cnn-score-label">{t('module2.cnn.filter')}</span>
                  <div className="m2-cnn-score-grid">
                    {kernel.map((value, index) => (
                      <span key={`filter-${index}`} className="m2-cnn-score-grid--filter">
                        {value > 0 ? `+${value}` : value}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="m2-cnn-score-label">{t('module2.cnn.scorePieces')}</span>
                  <div className="m2-cnn-score-grid">
                    {scoreParts.map(({ product }, index) => (
                      <span
                        key={`product-${index}`}
                        className={product > 0 ? 'is-positive' : product < 0 ? 'is-negative' : ''}
                      >
                        {product > 0 ? `+${product}` : product}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="m2-section-subtitle" style={{ marginTop: 28 }}>
          {t('module2.cnn.realImage')}
        </p>
        <EdgeDetectionCards activeEdgePreset={activeEdgePreset} />
      </div>
    </section>
  )
}

export default ScanningSection
