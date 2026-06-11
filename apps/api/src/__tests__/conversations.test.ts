import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestApp, login } from './test-app'

describe('Conversations API', () => {
  let app: INestApplication

  beforeEach(async () => {
    app = await createTestApp()
  })

  afterEach(async () => {
    await app.close()
  })

  it('returns 401 without a token', async () => {
    const response = await request(app.getHttpServer()).get('/conversations')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('returns only caller conversations sorted by updatedAt descending', async () => {
    const token = await login(app, 'alex@example.com')
    const response = await request(app.getHttpServer())
      .get('/conversations')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    const conversations = response.body as Array<{ updatedAt: string; participantIds: string[] }>
    expect(conversations.length).toBeGreaterThan(0)

    const updatedAtValues = conversations.map((conversation) => Date.parse(conversation.updatedAt))
    expect(updatedAtValues).toEqual([...updatedAtValues].sort((left, right) => right - left))

    for (const conversation of conversations) {
      expect(conversation.participantIds).toContain('user-1')
    }
  })

  it('creates a conversation (201)', async () => {
    const token = await login(app, 'alex@example.com')
    const response = await request(app.getHttpServer())
      .post('/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: `Test conversation ${Date.now()}`, participantIds: ['user-3', 'user-4'] })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      id: expect.any(String),
      title: expect.stringContaining('Test conversation'),
      participantIds: expect.arrayContaining(['user-1', 'user-3', 'user-4']),
      lastMessagePreview: '',
      updatedAt: expect.any(String),
    })
    expect(response.headers.location).toBe(`/conversations/${response.body.id as string}`)
  })

  it('creates a conversation without a title (title is optional)', async () => {
    const token = await login(app, 'alex@example.com')
    const response = await request(app.getHttpServer())
      .post('/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ participantIds: ['user-3', 'user-4'] })

    expect(response.status).toBe(201)
    expect(response.body.title).toBeUndefined()
    expect(response.body.participantIds).toEqual(
      expect.arrayContaining(['user-1', 'user-3', 'user-4']),
    )
  })

  it('rejects a duplicate direct conversation with 409', async () => {
    const token = await login(app, 'alex@example.com')
    const response = await request(app.getHttpServer())
      .post('/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Duplicate check', participantIds: ['user-2'] })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('CONVERSATION_ALREADY_EXISTS')
  })

  it('rejects a non-existent participant with 400', async () => {
    const token = await login(app, 'alex@example.com')
    const response = await request(app.getHttpServer())
      .post('/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Invalid participants', participantIds: ['user-does-not-exist'] })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(response.body.error.details).toEqual({ participantIds: ['user-does-not-exist'] })
  })

  it('rejects unknown body fields with 400', async () => {
    const token = await login(app, 'alex@example.com')
    const response = await request(app.getHttpServer())
      .post('/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Strict check', participantIds: ['user-3'], unexpected: true })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})
