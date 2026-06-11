import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestApp, login, SEED_PASSWORD } from './test-app'

describe('Auth API', () => {
  let app: INestApplication

  beforeEach(async () => {
    app = await createTestApp()
  })

  afterEach(async () => {
    await app.close()
  })

  it('signs up a new user and returns a token and user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'new@example.com', password: 'password123', name: 'New User' })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      token: expect.any(String),
      user: { id: expect.any(String), name: 'New User', email: 'new@example.com' },
    })
  })

  it('issues a token that authorizes GET /me', async () => {
    const signup = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'me@example.com', password: 'password123', name: 'Me' })
    const token = (signup.body as { token: string }).token

    const meResponse = await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${token}`)

    expect(meResponse.status).toBe(200)
    expect(meResponse.body).toEqual({
      id: expect.any(String),
      name: 'Me',
      email: 'me@example.com',
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

    expect(alexMe.body).toEqual({ id: 'user-1', name: 'Alex', email: 'alex@example.com' })
    expect(samMe.body).toEqual({ id: 'user-2', name: 'Sam', email: 'sam@example.com' })
  })

  it('rejects duplicate signup with 409', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'alex@example.com', password: 'password123', name: 'Dup' })

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
      user: { id: 'user-1', name: expect.any(String), email: 'alex@example.com' },
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
      .send({ email: 'not-an-email', password: 'short', name: '' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects unknown fields on signup (400)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'x@example.com', password: 'password123', name: 'X', role: 'admin' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 401 for GET /me without a token', async () => {
    const response = await request(app.getHttpServer()).get('/me')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })
})
