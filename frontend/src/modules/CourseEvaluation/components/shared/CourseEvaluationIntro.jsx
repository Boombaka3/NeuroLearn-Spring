import { useT } from '../../../../i18n/useT'

const STEP_LABELS = {
  feedback: 'postEval.step.feedback',
  reflection: 'postEval.step.reflection',
  knowledge: 'postEval.step.knowledge',
  results: 'postEval.step.results',
}

export default function CourseEvaluationIntro({ currentStep, completedSteps = new Set() }) {
  const t = useT()
  return (
    <header className="ce-hero">
      <div className="ce-hero-copy">
        <span className="ce-eyebrow">{t('postEval.intro.eyebrow')}</span>
        <h1>{t('postEval.intro.title')}</h1>
        <p>{t('postEval.intro.body')}</p>
      </div>

      <div className="ce-progress-strip" aria-label={t('postEval.progress', { step: t(STEP_LABELS[currentStep]) })}>
        {Object.entries(STEP_LABELS).map(([step, label], index) => {
          const isActive = currentStep === step
          const isComplete = completedSteps.has(step)

          return (
            <div
              key={step}
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
