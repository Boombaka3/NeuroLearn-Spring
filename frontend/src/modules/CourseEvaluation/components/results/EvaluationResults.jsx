import { useT } from '../../../../i18n/useT'

export default function EvaluationResults({
  headingRef,
  attempt,
  results,
  isRetryingUpload,
  onRetryUpload,
  onContinue,
  submissionStatus = 'idle',
}) {
  const t = useT()
  const breakdownItems = Object.values(results.moduleBreakdown)
  const uploadStatus = attempt.remoteSubmissionStatus || 'idle'
  const showRetry = attempt.completedAt && uploadStatus !== 'synced'
  const uploadStatusLabel = uploadStatus === 'synced'
    ? t('postEval.results.storedDb')
    : uploadStatus === 'syncing'
      ? t('postEval.results.savingDb')
      : uploadStatus === 'failed'
        ? t('postEval.results.savedLocalRetry')
        : t('postEval.results.savedLocal')

  return (
    <section className="ce-panel ce-results-panel" aria-labelledby="results-heading">
      <div className="ce-panel-head">
        <h2 id="results-heading" ref={headingRef} tabIndex={-1}>{t('postEval.results.title')}</h2>
        <p>{t('postEval.results.helper')}</p>
      </div>

      <div className="ce-results-summary">
        <div className="ce-score-card">
          <span className="ce-score-label">{t('postEval.results.scoreLabel')}</span>
          <strong>{results.score} / {results.maxScore}</strong>
          <p>{results.passed ? t('postEval.results.scorePass') : t('postEval.results.scoreRetry')}</p>
        </div>

        <div className="ce-save-card">
          <span className="ce-score-label">{t('postEval.results.savedStatus')}</span>
          <strong>{attempt.completedAt ? uploadStatusLabel : t('postEval.results.inProgress')}</strong>
          {submissionStatus === 'success' && (
            <p className="eval-results__storage-note eval-results__storage-note--success">
              {t('postEval.results.savedSuccess')}
            </p>
          )}
          {submissionStatus === 'error' && (
            <p className="eval-results__storage-note eval-results__storage-note--error">
              {t('postEval.results.savedError')}
            </p>
          )}
          {(submissionStatus === 'idle' || submissionStatus === 'submitting') && (
            <p className="eval-results__storage-note eval-results__storage-note--pending">
              {t('postEval.results.savedPending')}
            </p>
          )}
          {attempt.remoteSubmissionError && (
            <p className="ce-inline-error">{attempt.remoteSubmissionError}</p>
          )}
        </div>
      </div>

      {breakdownItems.length > 0 && (
        <div className="ce-breakdown">
          <h3>{t('postEval.results.moduleBreakdown')}</h3>
          <div className="ce-breakdown-grid">
            {breakdownItems.map((item) => (
              <div key={item.module} className="ce-breakdown-card">
                <span>{item.label}</span>
                <strong>{item.correct} / {item.total}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ce-actions">
        <div className="ce-actions-group">
          {showRetry && (
            <button
              type="button"
              className="shared-btn shared-btn-secondary"
              onClick={onRetryUpload}
              disabled={isRetryingUpload || uploadStatus === 'syncing'}
            >
              {isRetryingUpload || uploadStatus === 'syncing' ? t('postEval.results.retrying') : t('postEval.results.retrySave')}
            </button>
          )}
        </div>
        <button type="button" className="shared-btn shared-btn-primary" onClick={onContinue}>
          {t('postEval.results.continueCompletion')}
        </button>
      </div>
    </section>
  )
}
