import { useT } from '../../../../i18n/useT'

const SCALE_OPTIONS = [
  { value: 1, key: 'survey.scale.1' },
  { value: 2, key: 'survey.scale.2' },
  { value: 3, key: 'survey.scale.3' },
  { value: 4, key: 'survey.scale.4' },
  { value: 5, key: 'survey.scale.5' },
]

export default function LikertFeedbackSection({
  sectionId = 'course-feedback-heading',
  headingRef,
  title = 'Self-Reflection',
  helperText = 'Rate how strongly you agree with each statement.',
  questions,
  responses,
  onChange,
  errorMessage,
  onNext,
  primaryActionLabel = 'Next',
  secondaryActionLabel = '',
  onSecondaryAction,
  isBusy = false,
}) {
  const t = useT()
  return (
    <section className="ce-panel" aria-labelledby={sectionId}>
      <div className="ce-panel-head">
        <h2 id={sectionId} ref={headingRef} tabIndex={-1}>{title}</h2>
        <p>{helperText}</p>
      </div>

      <div className="ce-scale-legend" aria-label="Likert scale labels">
        {SCALE_OPTIONS.map((option) => (
          <span key={option.value}>
            <strong>{option.value}</strong> {t(option.key)}
          </span>
        ))}
      </div>

      <div className="ce-likert-list">
        {questions.map((question, index) => (
          <fieldset key={question.id} className="ce-likert-row">
            <legend>
              <span className="ce-question-number">{index + 1}</span>
              <span>{question.prompt}</span>
            </legend>

            <div className="ce-likert-options" role="radiogroup" aria-label={question.prompt}>
              {SCALE_OPTIONS.map((option) => {
                const checked = Number(responses[question.id]) === option.value

                return (
                  <label key={option.value} className={`ce-scale-option${checked ? ' is-selected' : ''}`}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={checked}
                      onChange={() => onChange(question.id, option.value)}
                      aria-label={`${question.prompt} ${option.value} ${t(option.key)}`}
                    />
                    <span className="ce-scale-value">{option.value}</span>
                    <span className="ce-scale-copy">{t(option.key)}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {errorMessage && <p className="ce-inline-error" role="alert">{errorMessage}</p>}

      <div className="ce-actions">
        {secondaryActionLabel && onSecondaryAction ? (
          <button type="button" className="shared-btn shared-btn-secondary" onClick={onSecondaryAction} disabled={isBusy}>
            {secondaryActionLabel}
          </button>
        ) : <span />}
        <button type="button" className="shared-btn shared-btn-primary" onClick={onNext} disabled={isBusy}>
          {primaryActionLabel}
        </button>
      </div>
    </section>
  )
}
