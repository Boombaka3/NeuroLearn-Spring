import type {
  EvaluationSubmissionPayload,
  EvaluationSubmissionResponse,
  QuizAttemptSubmission,
  QuizAttemptSubmissionResponse,
} from '../../types/submission'
import type { SpringAssessmentDetails, SpringAssessmentResponse, SpringQuizResponse } from '../../types/api'
import { ApiClientError, requestJson } from './client'
import { getCompletion } from './completion'

const PASSING_SCORE = 7

function rating(responses: Record<string, number>, id: string) {
  const value = Number(responses[id])
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error(`A rating from 1 through 5 is required for ${id}.`)
  }
  return value
}

function assessmentDetails(payload: EvaluationSubmissionPayload): SpringAssessmentDetails {
  return {
    neuronParts: rating(payload.likertResponses, 'likert-1'),
    neuronSignals: rating(payload.likertResponses, 'likert-2'),
    biologyAiRelationship: rating(payload.likertResponses, 'likert-3'),
    artificialNetworks: rating(payload.likertResponses, 'likert-4'),
    learningFromFeedback: rating(payload.likertResponses, 'likert-5'),
    continuedInterest: rating(payload.likertResponses, 'likert-6'),
    learningGoal: payload.openResponses?.['pre-goal'] || undefined,
    mostHelpful: payload.openResponses?.['open-1'] || undefined,
    improvementIdeas: payload.openResponses?.['open-2'] || undefined,
    additionalComments: payload.openResponses?.['open-3'] || undefined,
  }
}

export async function postQuizAttempt(payload: QuizAttemptSubmission): Promise<QuizAttemptSubmissionResponse> {
  let result: SpringQuizResponse
  try {
    result = await requestJson<SpringQuizResponse>('/api/quiz/submissions', {
      method: 'POST',
      body: JSON.stringify({ participantCode: payload.sessionId, answers: payload.selectedAnswers }),
    })
  } catch (error) {
    if (!(error instanceof ApiClientError) || error.status !== 409) throw error
    const completion = await getCompletion(payload.sessionId)
    if (!completion.quizSubmitted || completion.quizScore === null || completion.quizTotal === null) throw error
    result = {
      id: 'existing-quiz-submission',
      participantCode: completion.participantCode,
      submittedAt: new Date().toISOString(),
      score: completion.quizScore,
      total: completion.quizTotal,
      percentage: completion.quizScore * 100 / completion.quizTotal,
    }
  }

  return {
    ok: true,
    attempt: {
      id: result.id,
      sessionId: result.participantCode,
      source: payload.source || 'course-evaluation',
      startedAt: payload.startedAt || null,
      completedAt: payload.completedAt || null,
      submittedAt: result.submittedAt,
      score: result.score,
      maxScore: result.total,
      passed: result.score >= PASSING_SCORE,
      selectedAnswers: { ...payload.selectedAnswers },
      moduleBreakdown: {},
    },
  }
}

export async function postEvaluationSubmission(payload: EvaluationSubmissionPayload): Promise<EvaluationSubmissionResponse> {
  const normalizedResponses = payload.skipped
    ? Object.fromEntries(Array.from({ length: 6 }, (_, index) => [`likert-${index + 1}`, 3]))
    : payload.likertResponses
  const normalizedPayload = { ...payload, likertResponses: normalizedResponses }
  const details = assessmentDetails(normalizedPayload)
  const answers = {
    aiFamiliarity: Math.round((details.biologyAiRelationship + details.continuedInterest) / 2),
    neuronUnderstanding: Math.round((details.neuronParts + details.neuronSignals) / 2),
    aiUnderstanding: Math.round((details.artificialNetworks + details.learningFromFeedback) / 2),
  }
  const path = payload.source === 'pre-course' ? '/api/assessments/pre' : '/api/assessments/post'
  let result: SpringAssessmentResponse
  try {
    result = await requestJson<SpringAssessmentResponse>(path, {
      method: 'POST',
      body: JSON.stringify({ participantCode: payload.sessionId, answers, details, skipped: Boolean(payload.skipped) }),
    })
  } catch (error) {
    if (!(error instanceof ApiClientError) || error.status !== 409) throw error
    result = {
      id: `existing-${payload.source}`,
      participantCode: payload.sessionId,
      type: payload.source === 'pre-course' ? 'PRE' : 'POST',
      submittedAt: new Date().toISOString(),
      skipped: Boolean(payload.skipped),
    }
  }

  return {
    ok: true,
    submission: {
      id: result.id,
      sessionId: result.participantCode,
      source: payload.source,
      startedAt: payload.startedAt || null,
      completedAt: payload.completedAt || null,
      submittedAt: result.submittedAt,
      skipped: result.skipped,
      likertResponses: { ...payload.likertResponses },
      openResponses: { ...(payload.openResponses || {}) },
      quizAttemptId: payload.quizAttemptId || null,
    },
  }
}
