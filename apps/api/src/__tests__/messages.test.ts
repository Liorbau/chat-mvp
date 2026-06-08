import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import { resetStore } from '../db/store'

type LoginBody = {
  token: string
  user: { id: string }
}

type MessageItem = {
  id: string
  senderId: string
  content: string
  createdAt: string
}

type ListMessagesBody = {
  messages: MessageItem[]
  nextCursor: string | null
}

function createApiClient() {
  return request(createApp())
}

async function loginAndGetAuthHeader(
  client: Awaited<ReturnType<typeof createApiClient>>,
  userId: string,
): Promise<string> {
  const loginResponse = await client.post('/auth/login').send({ userId })
  expect(loginResponse.status).toBe(200)

  const body = loginResponse.body as LoginBody
  return `Bearer ${body.token}`
}

describe('Messages API', () => {
  let api: Awaited<ReturnType<typeof createApiClient>>

  beforeEach(() => {
    resetStore()
    api = createApiClient()
  })

  it('returns 404 for non-member requesting conversation messages', async () => {
    const authorization = await loginAndGetAuthHeader(api, 'user-2')
    const response = await api
      .get('/conversations/conv-3/messages')
      .set('Authorization', authorization)

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Conversation not found',
      },
    })
  })

  it('respects limit and returns nextCursor for pagination', async () => {
    const authorization = await loginAndGetAuthHeader(api, 'user-1')
    const firstPageResponse = await api
      .get('/conversations/conv-1/messages?limit=2')
      .set('Authorization', authorization)

    expect(firstPageResponse.status).toBe(200)
    const firstPage = firstPageResponse.body as ListMessagesBody

    expect(firstPage.messages).toHaveLength(2)
    expect(firstPage.nextCursor).toEqual(expect.any(String))
    expect(Date.parse(firstPage.messages[0]!.createdAt)).toBeLessThanOrEqual(
      Date.parse(firstPage.messages[1]!.createdAt),
    )

    const secondPageResponse = await api
      .get(
        `/conversations/conv-1/messages?limit=2&cursor=${encodeURIComponent(firstPage.nextCursor!)}`,
      )
      .set('Authorization', authorization)

    expect(secondPageResponse.status).toBe(200)
    const secondPage = secondPageResponse.body as ListMessagesBody
    expect(secondPage.messages).toHaveLength(1)
    expect(secondPage.nextCursor).toBeNull()
    const secondPageCreatedAt = Date.parse(secondPage.messages[0]!.createdAt)
    expect(secondPageCreatedAt).toBeLessThanOrEqual(Date.parse(firstPage.messages[0]!.createdAt))

    const firstPageIds = new Set(firstPage.messages.map((message) => message.id))
    const overlap = secondPage.messages.some((message) => firstPageIds.has(message.id))
    expect(overlap).toBe(false)
  })

  it('returns 400 for invalid cursor', async () => {
    const authorization = await loginAndGetAuthHeader(api, 'user-1')
    const response = await api
      .get('/conversations/conv-1/messages?cursor=not-a-valid-cursor')
      .set('Authorization', authorization)

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(response.body.error.message).toBe('Invalid request')
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['cursor'],
          message: 'cursor is invalid',
        }),
      ]),
    )
  })

  it('returns 400 for empty or missing content', async () => {
    const authorization = await loginAndGetAuthHeader(api, 'user-1')

    const emptyContentResponse = await api
      .post('/conversations/conv-1/messages')
      .set('Authorization', authorization)
      .send({ content: '   ' })
    expect(emptyContentResponse.status).toBe(400)
    expect(emptyContentResponse.body.error.code).toBe('VALIDATION_ERROR')

    const missingContentResponse = await api
      .post('/conversations/conv-1/messages')
      .set('Authorization', authorization)
      .send({})
    expect(missingContentResponse.status).toBe(400)
    expect(missingContentResponse.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 201 and derives senderId from auth token user', async () => {
    const authorization = await loginAndGetAuthHeader(api, 'user-2')
    const content = `Message sent from token ${Date.now()}`

    const response = await api
      .post('/conversations/conv-2/messages')
      .set('Authorization', authorization)
      .send({ content })

    expect(response.status).toBe(201)
    expect(response.body.message).toEqual({
      id: expect.any(String),
      conversationId: 'conv-2',
      senderId: 'user-2',
      content,
      createdAt: expect.any(String),
    })
  })

  it('returns 400 for unexpected body fields', async () => {
    const authorization = await loginAndGetAuthHeader(api, 'user-2')

    const response = await api
      .post('/conversations/conv-2/messages')
      .set('Authorization', authorization)
      .send({
        content: 'hello',
        senderId: 'user-1',
      })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})
