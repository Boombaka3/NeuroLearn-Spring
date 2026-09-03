import type { SpringCompletionResponse } from '../../types/api'
import { requestJson } from './client'

export function getCompletion(participantCode: string) {
  return requestJson<SpringCompletionResponse>(
    `/api/completion/${encodeURIComponent(participantCode)}`,
  )
}
