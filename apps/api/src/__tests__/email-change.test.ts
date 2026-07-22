import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SEED_USER_IDS } from '../db/store'
import { EmailChangeTokenService } from '../modules/auth/email-change-token.service'
import {
  EMAIL_PROVIDER,
  type EmailProvider,
  type SendEmailInput,
} from '../modules/email/providers/email.provider'
import { UsersDbService } from '../modules/users/users.dbService'
import { createTestApp, login } from './test.app'

describe('Email change API', () => {
  let app: INestApplication
  const sent: SendEmailInput[] = []
  const emailProvider: EmailProvider = {
    send: (input) => {
      sent.push(input)
      return Promise.resolve({ messageId: 'log:test' })
    },
  }

  beforeEach(async () => {
    sent.length = 0
    app = await createTestApp('chat-test-email-change', (builder) =>
      builder.overrideProvider(EMAIL_PROVIDER).useValue(emailProvider),
    )
  })

  afterEach(async () => {
    await app.close()
  })

  // The confirmation link carries the token as ?emailChangeToken=<jwt> (root query).
  function tokenFromLastEmail(): string {
    const token = sent.at(-1)?.text.match(/emailChangeToken=([^\s]+)/)?.[1]
    if (!token) {
      throw new Error('no email-change token found in the sent email')
    }
    return token
  }

  it('sends a confirmation email to the new address and returns confirmation_sent', async () => {
    const token = await login(app, 'alex@example.com')

    const response = await request(app.getHttpServer())
      .post('/me/email')
      .set('Authorization', `Bearer ${token}`)
      .send({ newEmail: 'alex.new@example.com' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'confirmation_sent' })
    expect(sent).toHaveLength(1)
    expect(sent[0]?.to).toBe('alex.new@example.com')
  })

  it('confirms with the emailed token: swaps email, records the old one, isolates others', async () => {
    const token = await login(app, 'alex@example.com')
    await request(app.getHttpServer())
      .post('/me/email')
      .set('Authorization', `Bearer ${token}`)
      .send({ newEmail: 'alex.new@example.com' })

    const confirm = await request(app.getHttpServer())
      .post('/auth/email/confirm')
      .send({ token: tokenFromLastEmail() })

    expect(confirm.status).toBe(200)
    expect(confirm.body).toMatchObject({
      id: SEED_USER_IDS.alex,
      email: 'alex.new@example.com',
      previousEmails: ['alex@example.com'],
    })

    const sam = await app.get(UsersDbService).findById(SEED_USER_IDS.sam)
    expect(sam?.email).toBe('sam@example.com')
    expect(sam?.previousEmails).toEqual([])
  })

  it('rejects requesting the current email with 400', async () => {
    const token = await login(app, 'alex@example.com')

    const response = await request(app.getHttpServer())
      .post('/me/email')
      .set('Authorization', `Bearer ${token}`)
      .send({ newEmail: 'alex@example.com' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects requesting an email already taken by another user with 409', async () => {
    const token = await login(app, 'alex@example.com')

    const response = await request(app.getHttpServer())
      .post('/me/email')
      .set('Authorization', `Bearer ${token}`)
      .send({ newEmail: 'sam@example.com' })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS')
  })

  it('rejects a request without a session token with 401', async () => {
    const response = await request(app.getHttpServer())
      .post('/me/email')
      .send({ newEmail: 'x@example.com' })

    expect(response.status).toBe(401)
  })

  it('rejects confirm with an invalid token with 401', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/email/confirm')
      .send({ token: 'not-a-valid-token' })

    expect(response.status).toBe(401)
  })

  it('treats confirm as a no-op when the token email equals the current email', async () => {
    const signed = await app
      .get(EmailChangeTokenService)
      .sign({ userId: SEED_USER_IDS.alex, newEmail: 'alex@example.com' })

    const response = await request(app.getHttpServer())
      .post('/auth/email/confirm')
      .send({ token: signed })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ email: 'alex@example.com', previousEmails: [] })
  })

  it('caps previousEmails at 10, dropping the oldest (FIFO)', async () => {
    const db = app.get(UsersDbService)
    for (let i = 1; i <= 11; i++) {
      await db.setEmailWithHistory(SEED_USER_IDS.alex, `change${i}@example.com`)
    }

    const user = await db.findById(SEED_USER_IDS.alex)
    expect(user?.previousEmails).toHaveLength(10)
    expect(user?.previousEmails).not.toContain('alex@example.com')
    expect(user?.previousEmails?.[0]).toBe('change1@example.com')
    expect(user?.previousEmails?.[9]).toBe('change10@example.com')
    expect(user?.email).toBe('change11@example.com')
  })
})
