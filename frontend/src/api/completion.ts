import { requestJson } from './client'
import type { CompletionStatusResponse } from '../types/api'

export const getCompletion = (participantCode: string) =>
  requestJson<CompletionStatusResponse>(`/api/completion/${encodeURIComponent(participantCode)}`)
