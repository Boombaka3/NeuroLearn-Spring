import { afterEach, describe, expect, it, vi } from 'vitest'
import { getCompletion } from './completion'
import { generateCertificateDocument } from './certificate'

describe('Spring API adapters', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('loads authoritative completion status for an encoded participant code', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        participantCode: 'BRAIN-SESSION1',
        preAssessmentSubmitted: true,
        quizSubmitted: true,
        postAssessmentSubmitted: true,
        quizScore: 9,
        quizTotal: 10,
        complete: true,
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getCompletion('BRAIN-SESSION1')

    expect(result.complete).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/completion/BRAIN-SESSION1',
      expect.objectContaining({ credentials: 'same-origin' }),
    )
  })

  it('requests a PDF certificate without storing the display name', async () => {
    localStorage.setItem('brain_ai_101_session_id', 'BRAIN-SESSION1')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({
        'Content-Disposition': 'attachment; filename="neurolearn-certificate-BRAIN-SESSION1.pdf"',
      }),
      blob: async () => new Blob(['%PDF-1.7'], { type: 'application/pdf' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await generateCertificateDocument('Ada Lovelace')

    expect(result.filename).toBe('neurolearn-certificate-BRAIN-SESSION1.pdf')
    const request = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(request).toEqual({ participantCode: 'BRAIN-SESSION1', displayName: 'Ada Lovelace' })
    expect(Object.values(localStorage)).not.toContain('Ada Lovelace')
  })
})
