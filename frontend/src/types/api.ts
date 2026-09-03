export interface ApiErrorPayload {
  timestamp?: string
  status?: number
  code?: string
  message?: string
  fieldErrors?: Record<string, string>
}

export interface SpringAssessmentDetails {
  neuronParts: number
  neuronSignals: number
  biologyAiRelationship: number
  artificialNetworks: number
  learningFromFeedback: number
  continuedInterest: number
  learningGoal?: string
  mostHelpful?: string
  improvementIdeas?: string
  additionalComments?: string
}

export interface SpringAssessmentResponse {
  id: string
  participantCode: string
  type: 'PRE' | 'POST'
  submittedAt: string
  skipped: boolean
}

export interface SpringQuizResponse {
  id: string
  participantCode: string
  submittedAt: string
  score: number
  total: number
  percentage: number
}

export interface SpringCompletionResponse {
  participantCode: string
  preAssessmentSubmitted: boolean
  quizSubmitted: boolean
  quizScore: number | null
  quizTotal: number | null
  postAssessmentSubmitted: boolean
  complete: boolean
  completedAt: string | null
}
