import { requestBlob } from './client'
import { getOrCreateSessionId } from '../../modules/CourseEvaluation/lib/courseEvaluationStorage'

export function generateCertificateDocument(recipientName: string) {
  return requestBlob('/api/certificates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participantCode: getOrCreateSessionId(), displayName: recipientName }),
  })
}
