import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestApp, login } from './test-app'

describe('Users API', () => {
  let app: INestApplication

  beforeEach(async () => {
    app = await createTestApp()
  })

  afterEach(async () => {
    await app.close()
  })

  it('returns 401 without a token', async () => {
    const response = await request(app.getHttpServer()).get('/users')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('returns the public users (no password hash) for an authed caller', async () => {
    const token = await login(app, 'alex@example.com')
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    const users = response.body as Array<Record<string, unknown>>
    expect(users.length).toBeGreaterThanOrEqual(4)
    for (const user of users) {
      expect(Object.keys(user).sort()).toEqual(['email', 'id', 'name'])
      expect(user).not.toHaveProperty('passwordHash')
    }
    expect(users).toContainEqual({ id: 'user-1', name: 'Alex', email: 'alex@example.com' })
  })
})
