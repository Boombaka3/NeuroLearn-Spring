import { postJson } from './client'
import type { QuizSubmissionRequest, QuizSubmissionResponse } from '../types/api'

export const submitQuiz = (request: QuizSubmissionRequest) =>
  postJson<QuizSubmissionRequest, QuizSubmissionResponse>('/api/quiz/submissions', request)
