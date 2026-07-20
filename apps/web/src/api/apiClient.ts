import type { ApiError } from '@chat/contract'
import { clearStoredAuth, getToken } from '@/shared/auth/authStorage'

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000'

export class ApiRequestError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown

  constructor(status: number, code: string, message: string, details: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value != null &&
    'error' in value &&
    typeof (value as ApiError).error === 'object'
  )
}

export async function throwApiError(response: Response, clearAuthOn401 = true): Promise<never> {
  if (response.status === 401 && clearAuthOn401) {
    clearStoredAuth()
  }
  const body: unknown = await response.json().catch(() => null)
  if (isApiError(body)) {
    throw new ApiRequestError(
      response.status,
      body.error.code,
      body.error.message,
      body.error.details,
    )
  }
  throw new ApiRequestError(
    response.status,
    'UNKNOWN',
    `Request failed (${response.status})`,
    undefined,
  )
}

export function buildHeaders(hasBody: boolean, init?: HeadersInit): Headers {
  const headers = new Headers(init)
  if (hasBody) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token != null) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return headers
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = buildHeaders(init.body !== undefined, init.headers)
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })

  if (!response.ok) {
    await throwApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
