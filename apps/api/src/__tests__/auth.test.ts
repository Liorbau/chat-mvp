import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import { resetStore } from '../db/store'

function createApiClient() {
  return request(createApp())
}

async function loginAs(
  client: Awaited<ReturnType<typeof createApiClient>>,
  userId: string,
): Promise<{ token: string; user: { id: string } }> {
  const response = await client.post('/auth/login').send({ userId })
  expect(response.status).toBe(200)
  return response.body as { token: string; user: { id: string } }
}

describe('Auth API', () => {
  let api: Awaited<ReturnType<typeof createApiClient>>

  beforeEach(() => {
    resetStore()
    api = createApiClient()
  })

  it('returns 200 with token and user for a valid login', async () => {
    const response = await api.post('/auth/login').send({ userId: 'user-1' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      token: expect.any(String),
      user: {
        id: 'user-1',
        name: expect.any(String),
        email: expect.any(String),
      },
    })
  })

  it('returns 401 for unknown userId login', async () => {
    const response = await api.post('/auth/login').send({ userId: 'unknown-user-id' })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      },
    })
  })

  it('returns 400 for malformed JSON request body', async () => {
    const response = await api
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"userId":')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid JSON body',
      },
    })
  })

  it('returns 413 when request body is too large', async () => {
    const oversizedUserId = 'x'.repeat(200_000)
    const response = await api
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ userId: oversizedUserId })

    expect(response.status).toBe(413)
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request body too large',
      },
    })
  })

  it('returns 401 when bearer token is missing on protected routes', async () => {
    const response = await api.get('/conversations')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or malformed Authorization header',
      },
    })
  })

  it('returns 401 when bearer token is malformed on protected routes', async () => {
    const response = await api.get('/conversations').set('Authorization', 'NotBearer some-token')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or malformed Authorization header',
      },
    })
  })

  it('returns 204 on logout and invalidates token for subsequent access', async () => {
    const loginResult = await loginAs(api, 'user-1')
    const authHeader = `Bearer ${loginResult.token}`

    const logoutResponse = await api.post('/auth/logout').set('Authorization', authHeader)
    expect(logoutResponse.status).toBe(204)
    expect(logoutResponse.text).toBe('')

    const protectedResponse = await api.get('/conversations').set('Authorization', authHeader)
    expect(protectedResponse.status).toBe(401)
    expect(protectedResponse.body).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    })
  })

  it('returns 401 on logout without a token', async () => {
    const response = await api.post('/auth/logout')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or malformed Authorization header',
      },
    })
  })
})
