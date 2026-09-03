import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSubmitEvaluation } from '../useSubmitEvaluation'

describe('useSubmitEvaluation', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submits evaluation responses successfully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'eval_1',
          participantCode: 'BRAIN-SESSION1',
          type: 'PRE',
          submittedAt: '2026-06-01T00:00:00.000Z',
          skipped: false,
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useSubmitEvaluation())

    await act(async () => {
      await result.current.submit({
        sessionId: 'BRAIN-SESSION1',
        source: 'pre-course',
        likertResponses: { 'likert-1': 4, 'likert-2': 4, 'likert-3': 4, 'likert-4': 4, 'likert-5': 4, 'likert-6': 4 },
        openResponses: {},
      })
    })

    expect(result.current.status).toBe('success')
    expect(result.current.data?.submission.id).toBe('eval_1')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/assessments/pre',
      expect.objectContaining({ method: 'POST' }),
    )
    const request = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(request).toMatchObject({
      participantCode: 'BRAIN-SESSION1',
      answers: { aiFamiliarity: 4, neuronUnderstanding: 4, aiUnderstanding: 4 },
      details: { neuronParts: 4, continuedInterest: 4 },
      skipped: false,
    })
  })
})
