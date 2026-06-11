import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '../api/chatApi.types'
import { ApiRequestError, getConversations, signup } from '../api/apiClient'
import { clearStoredAuth, getToken, saveAuth } from '../../auth/authStorage'

const user: User = { id: 'user-1', name: 'Alex', email: 'alex@example.com' }

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  clearStoredAuth()
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('apiClient', () => {
  it('attaches the Authorization header from the stored token', async () => {
    saveAuth({ token: 'tok-123', user })
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([]))

    await getConversations()

    const init = fetchMock.mock.calls[0]?.[1]
    const headers = new Headers(init?.headers)
    expect(headers.get('Authorization')).toBe('Bearer tok-123')
  })

  it('clears stored auth on a 401 and throws ApiRequestError', async () => {
    saveAuth({ token: 'tok-123', user })
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401),
    )

    await expect(getConversations()).rejects.toBeInstanceOf(ApiRequestError)
    expect(getToken()).toBeNull()
  })

  it('surfaces the error code and details from the envelope', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request',
            details: ['password must be longer than or equal to 8 characters'],
          },
        },
        400,
      ),
    )

    const error = await signup({ email: 'a@b.com', password: 'short', name: 'A' }).catch(
      (caught: unknown) => caught,
    )

    expect(error).toBeInstanceOf(ApiRequestError)
    const apiError = error as ApiRequestError
    expect(apiError.status).toBe(400)
    expect(apiError.code).toBe('VALIDATION_ERROR')
    expect(apiError.details).toEqual(['password must be longer than or equal to 8 characters'])
  })
})
