import { postJson, requestJson } from './client'
import type { AssessmentSubmissionRequest, AssessmentSubmissionResponse, ParticipantAssessmentResponse } from '../types/api'

export const submitPreAssessment = (request: AssessmentSubmissionRequest) =>
  postJson<AssessmentSubmissionRequest, AssessmentSubmissionResponse>('/api/assessments/pre', request)

export const submitPostAssessment = (request: AssessmentSubmissionRequest) =>
  postJson<AssessmentSubmissionRequest, AssessmentSubmissionResponse>('/api/assessments/post', request)

export const getParticipantAssessments = (participantCode: string) =>
  requestJson<ParticipantAssessmentResponse>(`/api/assessments/participants/${encodeURIComponent(participantCode)}`)
