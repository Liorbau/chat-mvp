import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SEED_CONVERSATION_IDS, SEED_USER_IDS } from '../db/store'
import { MessagesDbService } from '../modules/messages/messages.dbService'
import { createTestApp, login } from './test.app'

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

describe('Messages API', () => {
  let app: INestApplication

  beforeEach(async () => {
    app = await createTestApp()
  })

  afterEach(async () => {
    await app.close()
  })

  it('returns 401 without a token', async () => {
    const response = await request(app.getHttpServer()).get(
      `/conversations/${SEED_CONVERSATION_IDS.onboarding}/messages`,
    )

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 403 for a non-participant (never the data)', async () => {
    const token = await login(app, 'sam@example.com')
    const response = await request(app.getHttpServer())
      .get(`/conversations/${SEED_CONVERSATION_IDS.designSync}/messages`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  it('returns 404 for a missing conversation', async () => {
    const token = await login(app, 'alex@example.com')
    const response = await request(app.getHttpServer())
      .get('/conversations/does-not-exist/messages')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND')
  })

  it('respects limit and returns nextCursor for pagination', async () => {
    const token = await login(app, 'alex@example.com')
    const firstPage = await request(app.getHttpServer())
      .get(`/conversations/${SEED_CONVERSATION_IDS.onboarding}/messages?limit=2`)
      .set('Authorization', `Bearer ${token}`)

    expect(firstPage.status).toBe(200)
    const firstBody = firstPage.body as ListMessagesBody
    expect(firstBody.messages).toHaveLength(2)
    expect(firstBody.nextCursor).toEqual(expect.any(String))

    const secondPage = await request(app.getHttpServer())
      .get(
        `/conversations/${SEED_CONVERSATION_IDS.onboarding}/messages?limit=2&cursor=${encodeURIComponent(firstBody.nextCursor!)}`,
      )
      .set('Authorization', `Bearer ${token}`)

    expect(secondPage.status).toBe(200)
    const secondBody = secondPage.body as ListMessagesBody
    expect(secondBody.messages).toHaveLength(1)
    expect(secondBody.nextCursor).toBeNull()
  })

  it('returns 400 for an invalid cursor', async () => {
    const token = await login(app, 'alex@example.com')
    const response = await request(app.getHttpServer())
      .get(`/conversations/${SEED_CONVERSATION_IDS.onboarding}/messages?cursor=not-a-valid-cursor`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for an invalid conversation id path param', async () => {
    const token = await login(app, 'alex@example.com')
    const response = await request(app.getHttpServer())
      .get('/conversations/%20/messages')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('creates a message and derives senderId from the token (201)', async () => {
    const token = await login(app, 'sam@example.com')
    const content = `Message ${Date.now()}`
    const response = await request(app.getHttpServer())
      .post(`/conversations/${SEED_CONVERSATION_IDS.productFeedback}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content })

    expect(response.status).toBe(201)
    expect(response.body.message).toEqual({
      id: expect.any(String),
      conversationId: SEED_CONVERSATION_IDS.productFeedback,
      senderId: SEED_USER_IDS.sam,
      content,
      createdAt: expect.any(String),
    })
  })

  it('returns 400 for empty content', async () => {
    const token = await login(app, 'alex@example.com')
    const response = await request(app.getHttpServer())
      .post(`/conversations/${SEED_CONVERSATION_IDS.onboarding}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '   ' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for unknown body fields', async () => {
    const token = await login(app, 'sam@example.com')
    const response = await request(app.getHttpServer())
      .post(`/conversations/${SEED_CONVERSATION_IDS.productFeedback}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'hello', senderId: SEED_USER_IDS.alex })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('derives a distinct senderId per token in a shared conversation', async () => {
    const alexToken = await login(app, 'alex@example.com')
    const samToken = await login(app, 'sam@example.com')

    const fromAlex = await request(app.getHttpServer())
      .post(`/conversations/${SEED_CONVERSATION_IDS.productFeedback}/messages`)
      .set('Authorization', `Bearer ${alexToken}`)
      .send({ content: 'from alex' })
    const fromSam = await request(app.getHttpServer())
      .post(`/conversations/${SEED_CONVERSATION_IDS.productFeedback}/messages`)
      .set('Authorization', `Bearer ${samToken}`)
      .send({ content: 'from sam' })

    expect(fromAlex.body.message.senderId).toBe(SEED_USER_IDS.alex)
    expect(fromSam.body.message.senderId).toBe(SEED_USER_IDS.sam)
  })

  it('cursor-paginates a 100+ message thread to completion', async () => {
    const token = await login(app, 'alex@example.com')
    const total = 150
    const base = Date.parse('2026-06-01T00:00:00.000Z')
    const drafts = Array.from({ length: total }, (_, index) => ({
      conversationId: SEED_CONVERSATION_IDS.onboarding,
      senderId: SEED_USER_IDS.alex,
      content: `m${index}`,
      createdAt: new Date(base + index * 1000).toISOString(),
    }))
    await app.get(MessagesDbService).reset(drafts)

    const collected: string[] = []
    let cursor: string | null = null
    let pages = 0
    do {
      const query = cursor === null ? '?limit=50' : `?limit=50&cursor=${encodeURIComponent(cursor)}`
      const response = await request(app.getHttpServer())
        .get(`/conversations/${SEED_CONVERSATION_IDS.onboarding}/messages${query}`)
        .set('Authorization', `Bearer ${token}`)
      expect(response.status).toBe(200)
      const body = response.body as ListMessagesBody
      expect(body.messages.length).toBeLessThanOrEqual(50)
      collected.push(...body.messages.map((message) => message.content))
      cursor = body.nextCursor
      pages += 1
    } while (cursor !== null && pages < 10)

    expect(cursor).toBeNull()
    expect(collected).toHaveLength(total)
    expect(new Set(collected).size).toBe(total)
  })
})
