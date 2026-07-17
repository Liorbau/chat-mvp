import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SEED_USER_IDS } from '../db/store'
import { createTestApp, login, SEED_PASSWORD } from './test.app'

describe('Auth API', () => {
  let app: INestApplication

  beforeEach(async () => {
    app = await createTestApp('chat-test-auth')
  })

  afterEach(async () => {
    await app.close()
  })

  it('signs up a new user and returns a token and user', async () => {
    const response = await request(app.getHttpServer()).post('/auth/signup').send({
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      token: expect.any(String),
      user: {
        id: expect.any(String),
        name: 'New User',
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        avatarUrl: null,
      },
    })
  })

  it('normalizes a mixed-case email to lowercase on signup', async () => {
    const response = await request(app.getHttpServer()).post('/auth/signup').send({
      email: '  Mixed@Example.COM ',
      password: 'password123',
      firstName: 'Mixed',
      lastName: 'Case',
    })

    expect(response.status).toBe(201)
    expect((response.body as { user: { email: string } }).user.email).toBe('mixed@example.com')
  })

  it('logs in case-insensitively against the email stored at signup', async () => {
    await request(app.getHttpServer()).post('/auth/signup').send({
      email: 'caseuser@example.com',
      password: 'password123',
      firstName: 'Case',
      lastName: 'User',
    })

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'CaseUser@Example.com', password: 'password123' })

    expect(response.status).toBe(200)
    expect((response.body as { user: { email: string } }).user.email).toBe('caseuser@example.com')
  })

  it('rejects a duplicate signup that differs only by email case with 409', async () => {
    const response = await request(app.getHttpServer()).post('/auth/signup').send({
      email: 'ALEX@example.com',
      password: 'password123',
      firstName: 'Dup',
      lastName: 'Case',
    })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS')
  })

  it('issues a token that authorizes GET /me', async () => {
    const signup = await request(app.getHttpServer()).post('/auth/signup').send({
      email: 'me@example.com',
      password: 'password123',
      firstName: 'Me',
      lastName: 'Myself',
    })
    const token = (signup.body as { token: string }).token

    const meResponse = await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${token}`)

    expect(meResponse.status).toBe(200)
    expect(meResponse.body).toEqual({
      id: expect.any(String),
      name: 'Me Myself',
      firstName: 'Me',
      lastName: 'Myself',
      email: 'me@example.com',
      avatarUrl: null,
    })
  })

  it('resolves the current user from the specific token (GET /me)', async () => {
    const alexToken = await login(app, 'alex@example.com')
    const samToken = await login(app, 'sam@example.com')

    const alexMe = await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${alexToken}`)
    const samMe = await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${samToken}`)

    expect(alexMe.body).toEqual({
      id: SEED_USER_IDS.alex,
      name: 'Alex Rivera',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex@example.com',
      avatarUrl: null,
    })
    expect(samMe.body).toEqual({
      id: SEED_USER_IDS.sam,
      name: 'Sam Chen',
      firstName: 'Sam',
      lastName: 'Chen',
      email: 'sam@example.com',
      avatarUrl: null,
    })
  })

  it('rejects duplicate signup with 409', async () => {
    const response = await request(app.getHttpServer()).post('/auth/signup').send({
      email: 'alex@example.com',
      password: 'password123',
      firstName: 'Dup',
      lastName: 'User',
    })

    expect(response.status).toBe(409)
    expect(response.body).toEqual({
      error: { code: 'EMAIL_ALREADY_EXISTS', message: expect.any(String) },
    })
  })

  it('logs in with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'alex@example.com', password: SEED_PASSWORD })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      token: expect.any(String),
      user: {
        id: SEED_USER_IDS.alex,
        name: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        email: 'alex@example.com',
        avatarUrl: null,
      },
    })
  })

  it('rejects a wrong password with 401', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'alex@example.com', password: 'wrong-password' })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' },
    })
  })

  it('rejects an unknown email with 401', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: SEED_PASSWORD })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('rejects signup with an invalid body (400)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'not-an-email', password: 'short', firstName: '', lastName: '' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects unknown fields on signup (400)', async () => {
    const response = await request(app.getHttpServer()).post('/auth/signup').send({
      email: 'x@example.com',
      password: 'password123',
      firstName: 'X',
      lastName: 'Y',
      role: 'admin',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects an oversized request body with 413', async () => {
    // Exceed the 100kb JSON body limit configured at bootstrap.
    const oversizedName = 'a'.repeat(200 * 1024)
    const response = await request(app.getHttpServer()).post('/auth/signup').send({
      email: 'big@example.com',
      password: 'password123',
      firstName: oversizedName,
      lastName: 'Big',
    })

    expect(response.status).toBe(413)
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE')
  })

  it('returns 401 for GET /me without a token', async () => {
    const response = await request(app.getHttpServer()).get('/me')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('updates first/last name and re-derives the display name (PATCH /me)', async () => {
    const token = await login(app, 'alex@example.com')

    const response = await request(app.getHttpServer())
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Alexander', lastName: 'Rivera' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: SEED_USER_IDS.alex,
      name: 'Alexander Rivera',
      firstName: 'Alexander',
      lastName: 'Rivera',
      email: 'alex@example.com',
      avatarUrl: null,
    })
  })

  it('updates only the email, leaving names untouched (PATCH /me)', async () => {
    const token = await login(app, 'alex@example.com')

    const response = await request(app.getHttpServer())
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'alex.new@example.com' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: SEED_USER_IDS.alex,
      name: 'Alex Rivera',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex.new@example.com',
      avatarUrl: null,
    })
  })

  it('merges a partial name update with the existing value (PATCH /me)', async () => {
    const token = await login(app, 'sam@example.com')

    const response = await request(app.getHttpServer())
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Samuel' })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      firstName: 'Samuel',
      lastName: 'Chen',
      name: 'Samuel Chen',
    })
  })

  it('rejects changing to an email already taken by another user with 409 (PATCH /me)', async () => {
    const token = await login(app, 'alex@example.com')

    const response = await request(app.getHttpServer())
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'sam@example.com' })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS')
  })

  it('rejects a PATCH /me with no updatable fields (400)', async () => {
    const token = await login(app, 'alex@example.com')

    const response = await request(app.getHttpServer())
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 401 for PATCH /me without a token', async () => {
    const response = await request(app.getHttpServer()).patch('/me').send({ firstName: 'X' })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })
})
