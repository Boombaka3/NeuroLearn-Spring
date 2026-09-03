import { useT } from '../../../../i18n/useT'
import GuidedAnatomyOverlay from './GuidedAnatomyOverlay'

function Module1AnatomySection({ onContinue }) {
  const t = useT()
  const parts = [
    t('module1.anatomy.part.dendrites'),
    t('module1.anatomy.part.soma'),
    t('module1.anatomy.part.axon'),
    t('module1.anatomy.part.terminals'),
  ]

  return (
    <section className="module1-section module1-anatomy-section">
      <div className="module1-anatomy-grid">
        <div className="module1-anatomy-copy">
          <p className="module1-eyebrow">{t('module1.anatomy.eyebrow')}</p>
          <h2 className="module1-anatomy-title">{t('module1.anatomy.title')}</h2>
          <p className="module1-anatomy-body">
            {t('module1.anatomy.body.line1')}
            {' '}
            {t('module1.anatomy.body.line2')}
            {' '}
            {t('module1.anatomy.body.line3')}
          </p>

          <div className="module1-anatomy-pill-row" aria-label={t('module1.anatomy.parts.aria')}>
            {parts.map((part) => (
              <span key={part} className="module1-anatomy-pill">{part}</span>
            ))}
          </div>

          <div className="module1-anatomy-note">
            <p className="module1-card-muted module1-text-reset">
              {t('module1.anatomy.note')}
            </p>
          </div>
        </div>

        <div className="module1-anatomy-stage">
          <GuidedAnatomyOverlay onComplete={onContinue} finishLabel={t('module1.anatomy.finish')} />
        </div>
      </div>
    </section>
  )
}

export default Module1AnatomySection
