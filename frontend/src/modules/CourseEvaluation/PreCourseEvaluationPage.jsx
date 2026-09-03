import { useEffect, useRef, useState } from 'react'
import LikertFeedbackSection from './components/feedback/LikertFeedbackSection'
import PreCourseEvaluationIntro from './components/feedback/PreCourseEvaluationIntro'
import { preCourseLikertQuestions } from './data/courseEvaluationData'
import { areLikertQuestionsComplete } from './lib/courseEvaluationLogic'
import {
  createPreCourseEvaluationAttempt,
  getOrCreateSessionId,
  loadPreCourseEvaluationAttempt,
  markPreCourseEvaluationSkipped,
  savePreCourseEvaluationAttempt,
  saveSubmissionToLocalStorage,
} from './lib/courseEvaluationStorage'
import {
  completePreCourseEvaluation,
  hydratePreCourseEvaluation,
  selectPreCourseEvaluationState,
  skipPreCourseEvaluation,
  startPreCourseEvaluation,
  updatePreCourseEvaluation,
} from '../../store/preCourseEvaluation'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useSubmitEvaluation } from '../../hooks/useSubmitEvaluation'
import './courseEvaluation.css'
import { useT } from '../../i18n/useT'

function hasSavedResponses(attempt) {
  return Object.keys(attempt?.likertResponses || {}).length > 0 || Boolean(attempt?.openResponse)
}

export default function PreCourseEvaluationPage({ onBack, onContinue }) {
  const t = useT()
  const dispatch = useAppDispatch()
  const { submit: submitEvaluation, isSubmitting } = useSubmitEvaluation()
  const preCourseState = useAppSelector(selectPreCourseEvaluationState)
  const {
    attemptId,
    startedAt,
    completedAt,
    skipped,
    likertResponses,
    openResponse,
    status,
    hydrated,
  } = preCourseState
  const [errorMessage, setErrorMessage] = useState('')
  const headingRef = useRef(null)
  const attempt = {
    attemptId,
    startedAt,
    completedAt,
    skipped,
    likertResponses,
    openResponse,
    source: 'pre-course',
    version: 1,
  }
  const hasStarted = status === 'draft' || (!completedAt && hasSavedResponses(attempt))

  useEffect(() => {
    if (!hydrated) {
      dispatch(hydratePreCourseEvaluation(loadPreCourseEvaluationAttempt()))
    }
  }, [dispatch, hydrated])

  useEffect(() => {
    if (hasStarted) {
      headingRef.current?.focus()
    }
  }, [hasStarted])

  const handleStart = () => {
    const savedAttempt = savePreCourseEvaluationAttempt(
      attemptId
        ? attempt
        : createPreCourseEvaluationAttempt({
            likertResponses,
            openResponse,
          }),
    )

    dispatch(startPreCourseEvaluation(savedAttempt))
    setErrorMessage('')
  }

  const handleLikertChange = (questionId, value) => {
    setErrorMessage('')

    const savedAttempt = savePreCourseEvaluationAttempt({
      ...attempt,
      likertResponses: {
        ...likertResponses,
        [questionId]: value,
      },
    })

    dispatch(updatePreCourseEvaluation(savedAttempt))
  }

  const handleSkip = async () => {
    const skippedAttempt = markPreCourseEvaluationSkipped()
    dispatch(skipPreCourseEvaluation(skippedAttempt))
    const evaluationPayload = {
      sessionId: getOrCreateSessionId(),
      source: 'pre-course',
      startedAt: skippedAttempt.startedAt,
      completedAt: skippedAttempt.completedAt,
      skipped: true,
      likertResponses: skippedAttempt.likertResponses,
      openResponses: skippedAttempt.openResponse ? { 'pre-goal': skippedAttempt.openResponse } : {},
    }
    try {
      await submitEvaluation(evaluationPayload)
    } catch (error) {
      saveSubmissionToLocalStorage('pre_evaluation', evaluationPayload)
      setErrorMessage(error instanceof Error ? error.message : t('postEval.results.savedError'))
      return
    }
    onContinue?.()
  }

  const handleSubmit = async () => {
    if (!areLikertQuestionsComplete(preCourseLikertQuestions, likertResponses)) {
      setErrorMessage(t('preEval.errorIncomplete'))
      return
    }

    const completedAttempt = savePreCourseEvaluationAttempt({
      ...attempt,
      skipped: false,
      completedAt: new Date().toISOString(),
      source: 'pre-course',
      version: 1,
    })

    dispatch(completePreCourseEvaluation(completedAttempt))
    const evaluationPayload = {
      sessionId: getOrCreateSessionId(),
      source: 'pre-course',
      startedAt: completedAttempt.startedAt,
      completedAt: completedAttempt.completedAt,
      skipped: false,
      likertResponses: completedAttempt.likertResponses,
      openResponses: completedAttempt.openResponse ? { 'pre-goal': completedAttempt.openResponse } : {},
    }
    try {
      await submitEvaluation(evaluationPayload)
    } catch (error) {
      saveSubmissionToLocalStorage('pre_evaluation', evaluationPayload)
      setErrorMessage(error instanceof Error ? error.message : t('postEval.results.savedError'))
      return
    }
    onContinue?.()
  }

  return (
    <div className="ce-page">
      <div className="ce-shell">
        <div className="ce-topbar">
          <button type="button" className="shared-btn shared-btn-ghost" onClick={onBack}>
            {t('preEval.backHome')}
          </button>
        </div>

        <PreCourseEvaluationIntro started={hasStarted} />

        {!hasStarted ? (
          <section className="ce-panel" aria-labelledby="pre-course-begin-heading">
            <div className="ce-panel-head">
              <h2 id="pre-course-begin-heading">{t('preEval.beforeBegin')}</h2>
              <p>{t('preEval.optional')}</p>
              <p>{t('preEval.helper')}</p>
            </div>

            <div className="ce-actions">
              {errorMessage ? <p className="ce-inline-error" role="alert">{errorMessage}</p> : null}
              <button type="button" className="shared-btn shared-btn-secondary" onClick={handleSkip} disabled={isSubmitting}>
                {isSubmitting ? t('preEval.saving') : t('preEval.skip')}
              </button>
              <button type="button" className="shared-btn shared-btn-primary" onClick={handleStart} disabled={isSubmitting}>
                {t('preEval.start')}
              </button>
            </div>
          </section>
        ) : (
          <LikertFeedbackSection
            sectionId="pre-course-likert-heading"
            headingRef={headingRef}
            title={t('preEval.beforeBegin')}
            helperText={t('preEval.helper')}
            questions={preCourseLikertQuestions}
            responses={attempt.likertResponses}
            onChange={handleLikertChange}
            errorMessage={errorMessage}
            onNext={handleSubmit}
            primaryActionLabel={isSubmitting ? t('preEval.saving') : t('preEval.submitStartModule1')}
            secondaryActionLabel={t('preEval.skip')}
            onSecondaryAction={handleSkip}
            isBusy={isSubmitting}
          />
        )}
      </div>
    </div>
  )
}
