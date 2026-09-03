import { useT } from '../../../../i18n/useT'

const STEP_LABELS = [
  'preEval.step.eval',
  'preEval.step.module1',
]

export default function PreCourseEvaluationIntro({ started }) {
  const t = useT()
  return (
    <header className="ce-hero">
      <div className="ce-hero-copy">
        <span className="ce-eyebrow">{t('preEval.optionalStep')}</span>
        <h1>{t('preEval.title')}</h1>
        <p>{t('preEval.intro')}</p>
      </div>

      <div className="ce-progress-strip" aria-label={t('preEval.progress')}>
        {STEP_LABELS.map((label, index) => {
          const isActive = index === 0
          const isComplete = started && index === 0

          return (
            <div
              key={label}
              className={`ce-progress-step${isActive ? ' is-active' : ''}${isComplete ? ' is-complete' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="ce-progress-index">{index + 1}</span>
              <span className="ce-progress-label">{t(label)}</span>
            </div>
          )
        })}
      </div>
    </header>
  )
}
