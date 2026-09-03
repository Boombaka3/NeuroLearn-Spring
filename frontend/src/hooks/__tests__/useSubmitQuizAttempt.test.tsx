import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSubmitQuizAttempt } from '../useSubmitQuizAttempt'

describe('useSubmitQuizAttempt', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submits a quiz attempt successfully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'quiz_1',
        participantCode: 'BRAIN-SESSION1',
        submittedAt: '2026-06-01T00:00:00.000Z',
        score: 9,
        total: 10,
        percentage: 90,
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useSubmitQuizAttempt())

    await act(async () => {
      await result.current.submit({
        sessionId: 'BRAIN-SESSION1',
        selectedAnswers: { q1: 'A', q2: 'A', q3: 'A', q4: 'A', q5: 'A', q6: 'A', q7: 'A', q8: 'A', q9: 'A', q10: 'A' },
      })
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/quiz/submissions',
      expect.objectContaining({
        method: 'POST',
      }),
    )
    expect(result.current.status).toBe('success')
    expect(result.current.data?.attempt.score).toBe(9)
  })

  it('surfaces API failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          ok: false,
          message: 'Database unavailable.',
        }),
      }),
    )

    const { result } = renderHook(() => useSubmitQuizAttempt())
    let capturedError = null

    await act(async () => {
      try {
        await result.current.submit({
          sessionId: 'BRAIN-SESSION2',
          selectedAnswers: { q1: 'B', q2: 'B', q3: 'B', q4: 'B', q5: 'B', q6: 'B', q7: 'B', q8: 'B', q9: 'B', q10: 'B' },
        })
      } catch (error) {
        capturedError = error
      }
    })

    expect(capturedError).toBeInstanceOf(Error)
    expect(capturedError.message).toBe('Database unavailable.')
    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Database unavailable.')
  })
})
