import { useId, useState } from 'react'
import { motion } from 'framer-motion'
import { useT } from '../../../../i18n/useT'

const SVG_VIEWBOX = '0 0 860 420'
const INPUTS = [
  { x: 100, y: 120, label: 'x1' },
  { x: 100, y: 210, label: 'x2' },
  { x: 100, y: 300, label: 'x3' },
]
const HIDDEN1 = [
  { x: 310, y: 90, label: 'h1' },
  { x: 310, y: 170, label: 'h2' },
  { x: 310, y: 250, label: 'h3' },
  { x: 310, y: 330, label: 'h4' },
]
const HIDDEN2 = [
  { x: 530, y: 120, label: 'h5' },
  { x: 530, y: 210, label: 'h6' },
  { x: 530, y: 300, label: 'h7' },
]
const OUTPUTS_SHALLOW = [
  { x: 730, y: 160, label: 'y1' },
  { x: 730, y: 260, label: 'y2' },
]
const OUTPUTS_DEEP = [
  { x: 760, y: 160, label: 'y1' },
  { x: 760, y: 260, label: 'y2' },
]
const SINGLE_NEURON = { x: 430, y: 210, label: 'n' }

function LayerTag({ x, y, label }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-54" y="-16" width="108" height="32" rx="16" fill="rgba(255,255,255,0.9)" stroke="#ddd6fe" />
      <text textAnchor="middle" fontSize="12" fontWeight="700" fill="#5b21b6">{label}</text>
    </g>
  )
}

function Connection({ from, to, stroke = '#cbd5e1', width = 2.1, opacity = 0.8 }) {
  const dx = to.x - from.x
  const curve = Math.max(28, Math.min(72, dx * 0.24))
  const d = `M ${from.x} ${from.y} C ${from.x + curve} ${from.y}, ${to.x - curve} ${to.y}, ${to.x} ${to.y}`
  return <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" opacity={opacity} />
}

function NeuronNode({ x, y, r, fill, stroke, textColor, label, ring = false }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth={2.5} />
      {ring && <circle cx={x} cy={y} r={r + 10} fill="none" stroke={stroke} strokeWidth={1.4} opacity={0.18} />}
      <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={textColor}>{label}</text>
    </g>
  )
}

function ConnectedNetworkSection() {
  const t = useT()
  const [stage, setStage] = useState(0)
  const markerId = useId()
  const stageLabels = [
    t('module1.connected.stage.label.0'),
    t('module1.connected.stage.label.1'),
    t('module1.connected.stage.label.2'),
    t('module1.connected.stage.label.3'),
  ]
  const stageDescs = [
    t('module1.connected.stage.desc.0'),
    t('module1.connected.stage.desc.1'),
    t('module1.connected.stage.desc.2'),
    t('module1.connected.stage.desc.3'),
  ]
  const stageButtons = [
    t('module1.connected.stage.button.0'),
    t('module1.connected.stage.button.1'),
    t('module1.connected.stage.button.2'),
    null,
  ]

  const isStage0 = stage === 0
  const showH2 = stage >= 3
  const showOut = stage >= 2
  const outputs = showH2 ? OUTPUTS_DEEP : OUTPUTS_SHALLOW
  const outputSources = showH2 ? HIDDEN2 : HIDDEN1

  return (
    <section className="module1-panel module1-soft-panel" style={{ marginTop: 20 }}>
      <div className="module1-section-heading" style={{ marginBottom: 18 }}>
        <p className="module1-eyebrow module1-eyebrow-tight">{t('module1.connected.eyebrow')}</p>
        <h3 className="module1-panel-title module1-panel-title-large">{t('module1.connected.title')}</h3>
        <p className="module1-card-muted module1-text-reset">{t('module1.connected.body')}</p>
      </div>

      <div style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
        <p className="module1-card-muted" style={{ margin: 0, fontWeight: 700, color: '#1d4ed8' }}>{stageLabels[stage]}</p>
        <p className="module1-card-muted module1-text-reset" style={{ margin: 0 }}>{stageDescs[stage]}</p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={SVG_VIEWBOX} className="ann-diagram-svg" aria-label={t('module1.connected.diagram.aria')} style={{ minWidth: 720 }}>
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#a78bfa" />
            </marker>
          </defs>

          {isStage0 && (
            <motion.g key="stage0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <LayerTag x={100} y={52} label={t('module1.connected.layer.input')} />
              <LayerTag x={430} y={52} label={t('module1.bridge.ann.title')} />

              {INPUTS.map((node) => (
                <Connection
                  key={`single-conn-${node.label}`}
                  from={{ x: node.x + 28, y: node.y }}
                  to={{ x: SINGLE_NEURON.x - 42, y: SINGLE_NEURON.y }}
                  stroke="#bfdbfe"
                  width={2.4}
                  opacity={0.95}
                />
              ))}

              {INPUTS.map((node) => (
                <NeuronNode key={node.label} x={node.x} y={node.y} r={28} fill="#eff6ff" stroke="#3b82f6" textColor="#1d4ed8" label={node.label} />
              ))}

              <NeuronNode x={SINGLE_NEURON.x} y={SINGLE_NEURON.y} r={40} fill="#f5f3ff" stroke="#7c3aed" textColor="#6d28d9" label="n" ring />

              <path
                d={`M ${SINGLE_NEURON.x + 42} ${SINGLE_NEURON.y} C ${SINGLE_NEURON.x + 88} ${SINGLE_NEURON.y}, ${SINGLE_NEURON.x + 112} ${SINGLE_NEURON.y}, ${SINGLE_NEURON.x + 152} ${SINGLE_NEURON.y}`}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="2.6"
                strokeLinecap="round"
                markerEnd={`url(#${markerId})`}
              />
              <text x={SINGLE_NEURON.x + 174} y={SINGLE_NEURON.y + 5} fontSize="13" fontWeight="700" fill="#166534">{t('module1.connected.diagram.output')}</text>
              <text x="430" y="388" textAnchor="middle" fontSize="13" fill="#64748b">
                {t('module1.connected.diagram.caption.single')}
              </text>
            </motion.g>
          )}

          {!isStage0 && (
            <motion.g key="network" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <LayerTag x={100} y={52} label={t('module1.connected.layer.input')} />
              <LayerTag x={310} y={52} label={t('module1.connected.layer.hidden')} />
              {showH2 && <LayerTag x={530} y={52} label={t('module1.connected.layer.hidden2')} />}
              {showOut && <LayerTag x={outputs[0].x} y={52} label={t('module1.connected.layer.output')} />}

              {INPUTS.flatMap((inputNode) =>
                HIDDEN1.map((hiddenNode) => (
                  <Connection key={`conn-i-${inputNode.label}-${hiddenNode.label}`} from={{ x: inputNode.x + 28, y: inputNode.y }} to={{ x: hiddenNode.x - 28, y: hiddenNode.y }} />
                ))
              )}

              {showH2 && HIDDEN1.flatMap((fromNode) =>
                HIDDEN2.map((toNode) => (
                  <Connection key={`conn-h1-${fromNode.label}-${toNode.label}`} from={{ x: fromNode.x + 28, y: fromNode.y }} to={{ x: toNode.x - 28, y: toNode.y }} stroke="#d8b4fe" />
                ))
              )}

              {showOut && outputSources.flatMap((fromNode) =>
                outputs.map((toNode) => (
                  <Connection key={`conn-out-${fromNode.label}-${toNode.label}`} from={{ x: fromNode.x + 28, y: fromNode.y }} to={{ x: toNode.x - 28, y: toNode.y }} stroke="#bbf7d0" />
                ))
              )}

              {INPUTS.map((node) => (
                <NeuronNode key={`input-${node.label}`} x={node.x} y={node.y} r={28} fill="#eff6ff" stroke="#3b82f6" textColor="#1d4ed8" label={node.label} />
              ))}

              {HIDDEN1.map((node) => (
                <NeuronNode key={`hidden1-${node.label}`} x={node.x} y={node.y} r={28} fill="#f5f3ff" stroke="#7c3aed" textColor="#6d28d9" label={node.label} ring />
              ))}

              {showH2 && HIDDEN2.map((node, index) => (
                <motion.g key={`hidden2-${node.label}`} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.08 }}>
                  <NeuronNode x={node.x} y={node.y} r={28} fill="#faf5ff" stroke="#a855f7" textColor="#7e22ce" label={node.label} ring />
                </motion.g>
              ))}

              {showOut && outputs.map((node, index) => (
                <motion.g key={`output-${node.label}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.08 }}>
                  <NeuronNode x={node.x} y={node.y} r={28} fill="#f0fdf4" stroke="#059669" textColor="#047857" label={node.label} />
                </motion.g>
              ))}

              <path
                d={`M ${outputs[outputs.length - 1].x + 30} 210 C ${outputs[outputs.length - 1].x + 72} 210, ${outputs[outputs.length - 1].x + 92} 210, ${outputs[outputs.length - 1].x + 128} 210`}
                fill="none"
                stroke="#86efac"
                strokeWidth="2.6"
                strokeLinecap="round"
                markerEnd={`url(#${markerId})`}
                opacity={showOut ? 1 : 0}
              />

              <text x="430" y="388" textAnchor="middle" fontSize="13" fill="#64748b">
                {t('module1.connected.diagram.caption.network')}
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      <div className="module1-inline-actions" style={{ marginTop: 16, justifyContent: 'center' }}>
        {stageButtons[stage] && (
          <button className="module1-primary-button" onClick={() => setStage((s) => Math.min(3, s + 1))}>
            {stageButtons[stage]}
          </button>
        )}
        {stage > 0 && (
          <button className="module1-secondary-button" onClick={() => setStage(0)}>{t('module1.connected.reset')}</button>
        )}
      </div>
    </section>
  )
}

export default ConnectedNetworkSection
