import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestApp, login } from './test.app'

describe('Avatar API', () => {
  let app: INestApplication
  let token: string

  beforeEach(async () => {
    app = await createTestApp('chat-test-avatar')
    token = await login(app, 'alex@example.com')
  })

  afterEach(async () => {
    await app.close()
  })

  it('rejects an oversize upload with a 400 (size validated in the pipe)', async () => {
    const response = await request(app.getHttpServer())
      .post('/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.alloc(6 * 1024 * 1024), {
        filename: 'big.png',
        contentType: 'image/png',
      })

    expect(response.status).toBe(400)
    expect((response.body as { error: { code: string } }).error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects a mislabeled non-image (claimed image/png) with a 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('this is not an image'), {
        filename: 'fake.png',
        contentType: 'image/png',
      })

    expect(response.status).toBe(400)
    expect((response.body as { error: { code: string } }).error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects a request with no file with a 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/me/avatar')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect((response.body as { error: { code: string } }).error.code).toBe('VALIDATION_ERROR')
  })

  it('requires authentication', async () => {
    const response = await request(app.getHttpServer()).post('/me/avatar')

    expect(response.status).toBe(401)
  })
})
