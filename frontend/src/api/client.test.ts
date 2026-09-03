import { afterEach, describe, expect, it, vi } from 'vitest'
import { postForBlob, requestJson } from './client'

describe('API client', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns JSON from a successful response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ status: 'UP' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    await expect(requestJson<{ status: string }>('/api/health')).resolves.toEqual({ status: 'UP' })
  })

  it('preserves the backend error contract', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ status: 400, code: 'VALIDATION_FAILED', message: 'Request validation failed', fieldErrors: { participantCode: 'must not be blank' } }), { status: 400, headers: { 'Content-Type': 'application/json' } }))
    await expect(requestJson('/api/completion/bad')).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED', fieldErrors: { participantCode: 'must not be blank' } })
  })

  it('returns certificate content and its server filename', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('%PDF', { status: 200, headers: { 'Content-Disposition': 'attachment; filename="brain-ai-101-alex.pdf"' } }))
    const result = await postForBlob('/api/certificates', { participantCode: 'BRAIN-101', displayName: 'Alex Doe' })
    expect(result.filename).toBe('brain-ai-101-alex.pdf')
    expect(result.blob.size).toBeGreaterThan(0)
  })

  it('converts network failures into a stable user-facing error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'))
    await expect(requestJson('/api/health')).rejects.toMatchObject({ message: 'The NeuroLearn service is unavailable. Check your connection and try again.' })
  })
})
