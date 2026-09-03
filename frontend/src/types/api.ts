export type AssessmentType = 'PRE' | 'POST'

export interface AssessmentAnswers {
  aiFamiliarity: number
  neuronUnderstanding: number
  aiUnderstanding: number
}

export interface AssessmentSubmissionRequest {
  participantCode: string
  answers: AssessmentAnswers
}

export interface AssessmentSubmissionResponse extends AssessmentSubmissionRequest {
  id: string
  type: AssessmentType
  submittedAt: string
}

export interface ParticipantAssessmentResponse {
  participantCode: string
  createdAt: string
  submissions: AssessmentSubmissionResponse[]
}

export interface QuizSubmissionRequest {
  participantCode: string
  answers: Record<string, string>
}

export interface QuizSubmissionResponse {
  id: string
  participantCode: string
  submittedAt: string
  score: number
  total: number
  percentage: number
}

export interface CompletionStatusResponse {
  participantCode: string
  preAssessmentSubmitted: boolean
  preSubmittedAt: string | null
  quizSubmitted: boolean
  quizSubmittedAt: string | null
  quizScore: number | null
  quizTotal: number | null
  postAssessmentSubmitted: boolean
  postSubmittedAt: string | null
  complete: boolean
  completedAt: string | null
}

export interface ApiErrorBody {
  timestamp: string
  status: number
  code: string
  message: string
  fieldErrors: Record<string, string>
}
