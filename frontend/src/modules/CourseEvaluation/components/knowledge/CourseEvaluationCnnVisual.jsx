import { useT } from '../../../../i18n/useT'

function renderGridCells(values, type = 'patch') {
  return values.map((value, index) => {
    let className = 'ce-cnn-grid-cell'

    if (type === 'kernel') {
      if (value > 0) className += ' is-kernel-positive'
      else if (value < 0) className += ' is-kernel-negative'
      else className += ' is-kernel-neutral'
    } else if (value > 0) {
      className += ' is-active'
    }

    return (
      <span key={`${type}-${index}`} className={className}>
        {value > 0 && type === 'kernel' ? `+${value}` : value}
      </span>
    )
  })
}

export default function CourseEvaluationCnnVisual({ visualType, visualData }) {
  const t = useT()

  if (visualType === 'cnn-output-size') {
    return (
      <div className="ce-cnn-panel">
        <div className="ce-cnn-copy-card">
          <strong>{t('postEval.cnn.setup')}</strong>
          <p>{t('postEval.cnn.setupBody')}</p>
        </div>

        <div className="ce-cnn-legend">
          <span className="ce-cnn-legend-chip ce-cnn-legend-chip--image">{t('postEval.cnn.input55')}</span>
          <span className="ce-cnn-legend-chip ce-cnn-legend-chip--padding">{t('postEval.cnn.filter33')}</span>
          <span className="ce-cnn-legend-chip ce-cnn-legend-chip--active">{t('postEval.cnn.stride1')}</span>
        </div>

        <div className="ce-cnn-formula-panel">
          <div className="ce-cnn-formula-grid">
            <div className="ce-cnn-formula-item">
              <span>{t('postEval.cnn.input')}</span>
              <strong>5 × 5</strong>
            </div>
            <div className="ce-cnn-formula-item">
              <span>{t('postEval.cnn.filter')}</span>
              <strong>3 × 3</strong>
            </div>
            <div className="ce-cnn-formula-item">
              <span>{t('postEval.cnn.padding')}</span>
              <strong>0</strong>
            </div>
            <div className="ce-cnn-formula-item">
              <span>{t('postEval.cnn.stride')}</span>
              <strong>1</strong>
            </div>
            <div className="ce-cnn-formula-item ce-cnn-formula-item--question">
              <span>{t('postEval.cnn.output')}</span>
              <strong>? × ?</strong>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (visualType === 'cnn-matrix-calculation') {
    return (
      <div className="ce-cnn-panel">
        <div className="ce-cnn-copy-card">
          <strong>{t('postEval.cnn.patchKernel')}</strong>
          <p>{t('postEval.cnn.patchKernelBody')}</p>
        </div>

        <div className="ce-cnn-matrix-layout">
          <div>
            <span className="ce-cnn-score-label">{t('postEval.cnn.imagePatch')}</span>
            <div className="ce-cnn-score-grid">
              {renderGridCells(visualData.patch, 'patch')}
            </div>
          </div>

          <div>
            <span className="ce-cnn-score-label">{t('postEval.cnn.kernel')}</span>
            <div className="ce-cnn-score-grid">
              {renderGridCells(visualData.kernel, 'kernel')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
