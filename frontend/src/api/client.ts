import type { ApiErrorBody } from '../types/api'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
export const API_BASE_URL = (configuredBaseUrl || (import.meta.env.DEV ? 'http://localhost:8080' : '')).replace(/\/$/, '')

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

async function errorFrom(response: Response): Promise<ApiClientError> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>
    return new ApiClientError(
      body.message || `Request failed with status ${response.status}`,
      response.status,
      body.code,
      body.fieldErrors || {},
    )
  } catch {
    return new ApiClientError(`Request failed with status ${response.status}`, response.status)
  }
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, init)
    if (!response.ok) throw await errorFrom(response)
    return response
  } catch (error) {
    if (error instanceof ApiClientError) throw error
    throw new ApiClientError('The NeuroLearn service is unavailable. Check your connection and try again.')
  }
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await send(path, init)
  return response.json() as Promise<T>
}

export async function postJson<TRequest, TResponse>(path: string, body: TRequest): Promise<TResponse> {
  return requestJson<TResponse>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function postForBlob<TRequest>(path: string, body: TRequest): Promise<{ blob: Blob; filename: string }> {
  const response = await send(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const disposition = response.headers.get('Content-Disposition') || ''
  const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || 'neurolearn-certificate.pdf'
  return { blob: await response.blob(), filename }
}
