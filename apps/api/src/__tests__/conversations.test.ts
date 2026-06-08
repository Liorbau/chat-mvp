import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import { resetStore } from '../db/store'

type LoginBody = {
  token: string
  user: { id: string }
}

function createApiClient() {
  return request(createApp())
}

async function loginAndGetAuthHeader(
  client: Awaited<ReturnType<typeof createApiClient>>,
  userId: string,
): Promise<{ authorization: string; userId: string }> {
  const loginResponse = await client.post('/auth/login').send({ userId })
  expect(loginResponse.status).toBe(200)

  const body = loginResponse.body as LoginBody
  return { authorization: `Bearer ${body.token}`, userId: body.user.id }
}

describe('Conversations API', () => {
  let api: Awaited<ReturnType<typeof createApiClient>>

  beforeEach(() => {
    resetStore()
    api = createApiClient()
  })

  it('returns only caller conversations sorted by updatedAt descending', async () => {
    const auth = await loginAndGetAuthHeader(api, 'user-1')
    const response = await api.get('/conversations').set('Authorization', auth.authorization)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBeGreaterThan(0)

    const updatedAtValues = (response.body as Array<{ updatedAt: string }>).map((conversation) => {
      return Date.parse(conversation.updatedAt)
    })
    const sortedCopy = [...updatedAtValues].sort((left, right) => right - left)
    expect(updatedAtValues).toEqual(sortedCopy)

    for (const conversation of response.body as Array<{ participantIds: string[] }>) {
      expect(conversation.participantIds).toContain(auth.userId)
    }
  })

  it('returns 409 for duplicate direct conversation', async () => {
    const auth = await loginAndGetAuthHeader(api, 'user-1')
    const response = await api
      .post('/conversations')
      .set('Authorization', auth.authorization)
      .send({
        title: 'Unique duplicate-check title',
        participantIds: ['user-2'],
      })

    expect(response.status).toBe(409)
    expect(response.body).toEqual({
      error: {
        code: 'CONVERSATION_ALREADY_EXISTS',
        message: 'A direct conversation for these participants already exists',
      },
    })
  })

  it('returns 400 when participant does not exist', async () => {
    const auth = await loginAndGetAuthHeader(api, 'user-1')
    const response = await api
      .post('/conversations')
      .set('Authorization', auth.authorization)
      .send({
        title: 'Invalid participants check',
        participantIds: ['user-does-not-exist'],
      })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(response.body.error.message).toBe('One or more participants do not exist')
    expect(response.body.error.details).toEqual({
      participantIds: ['user-does-not-exist'],
    })
  })

  it('returns 201 when creating a valid conversation', async () => {
    const auth = await loginAndGetAuthHeader(api, 'user-1')
    const response = await api
      .post('/conversations')
      .set('Authorization', auth.authorization)
      .send({
        title: `Test conversation ${Date.now()}`,
        participantIds: ['user-3', 'user-4'],
      })

    expect(response.status).toBe(201)
    expect(response.headers.location).toMatch(/^\/conversations\/.+/)
    expect(response.body).toEqual({
      id: expect.any(String),
      title: expect.stringContaining('Test conversation'),
      participantIds: expect.arrayContaining(['user-1', 'user-3', 'user-4']),
      lastMessagePreview: '',
      updatedAt: expect.any(String),
    })
  })

  it('returns 400 for unexpected body fields', async () => {
    const auth = await loginAndGetAuthHeader(api, 'user-1')
    const response = await api
      .post('/conversations')
      .set('Authorization', auth.authorization)
      .send({
        title: 'Strict schema check',
        participantIds: ['user-3'],
        unexpected: true,
      })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})
