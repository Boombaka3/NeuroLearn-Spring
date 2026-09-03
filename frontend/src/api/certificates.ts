import { postForBlob } from './client'

interface CertificateRequest {
  participantCode: string
  displayName: string
}

export const requestCertificate = (request: CertificateRequest) =>
  postForBlob('/api/certificates', request)
