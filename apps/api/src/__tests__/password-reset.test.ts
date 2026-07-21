import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SEED_USER_IDS } from '../db/store'
import { PasswordResetDbService } from '../modules/auth/password-reset.dbService'
import {
  EMAIL_PROVIDER,
  type EmailProvider,
  type SendEmailInput,
} from '../modules/email/providers/email.provider'
import { createTestApp, login, SEED_PASSWORD } from './test.app'

const NEW_PASSWORD = 'brand-new-password'

describe('Password reset API', () => {
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
    app = await createTestApp('chat-test-password-reset', (builder) =>
      builder.overrideProvider(EMAIL_PROVIDER).useValue(emailProvider),
    )
  })

  afterEach(async () => {
    await app.close()
  })

  // The reset email reads "Your password reset code is 123456."
  function codeFromLastEmail(): string {
    const code = sent.at(-1)?.text.match(/code is (\d{6})/)?.[1]
    if (code === undefined) {
      throw new Error('no reset code found in the sent email')
    }
    return code
  }

  async function requestCode(email: string): Promise<string> {
    await request(app.getHttpServer()).post('/auth/password/forgot').send({ email })
    return codeFromLastEmail()
  }

  it('emails a reset code and returns the generic status', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/password/forgot')
      .send({ email: 'alex@example.com' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'reset_code_sent' })
    expect(sent).toHaveLength(1)
    expect(sent[0]?.to).toBe('alex@example.com')
  })

  it('does not reveal unknown accounts: same status, no email sent', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/password/forgot')
      .send({ email: 'nobody@example.com' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'reset_code_sent' })
    expect(sent).toHaveLength(0)
  })

  it('resets the password with the emailed code and lets the user log in with it', async () => {
    const code = await requestCode('alex@example.com')

    const confirm = await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({ email: 'alex@example.com', code, newPassword: NEW_PASSWORD })

    expect(confirm.status).toBe(200)
    expect(confirm.body).toEqual({ status: 'password_reset' })

    const withNew = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'alex@example.com', password: NEW_PASSWORD })
    expect(withNew.status).toBe(200)

    const withOld = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'alex@example.com', password: SEED_PASSWORD })
    expect(withOld.status).toBe(401)
  })

  it('invalidates existing sessions: a token issued before the reset is rejected', async () => {
    const staleToken = await login(app, 'alex@example.com')
    const code = await requestCode('alex@example.com')

    await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({ email: 'alex@example.com', code, newPassword: NEW_PASSWORD })

    const afterReset = await request(app.getHttpServer())
      .get('/conversations')
      .set('Authorization', `Bearer ${staleToken}`)

    expect(afterReset.status).toBe(401)
  })

  it('rejects a wrong code with a generic 401 and leaves the password unchanged', async () => {
    const realCode = await requestCode('alex@example.com')
    const wrongCode = realCode === '999999' ? '000000' : '999999'

    const confirm = await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({ email: 'alex@example.com', code: wrongCode, newPassword: NEW_PASSWORD })

    expect(confirm.status).toBe(401)

    const stillOld = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'alex@example.com', password: SEED_PASSWORD })
    expect(stillOld.status).toBe(200)
  })

  it('is single-use: the same code cannot be redeemed twice', async () => {
    const code = await requestCode('alex@example.com')

    const first = await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({ email: 'alex@example.com', code, newPassword: NEW_PASSWORD })
    expect(first.status).toBe(200)

    const second = await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({ email: 'alex@example.com', code, newPassword: 'another-password' })
    expect(second.status).toBe(401)
  })

  it('rejects an expired code with 401', async () => {
    const code = await requestCode('alex@example.com')

    // Re-store the same hash with a past expiry to simulate the TTL window lapsing.
    const db = app.get(PasswordResetDbService)
    const stored = await db.findByUserId(SEED_USER_IDS.alex)
    if (stored === undefined) {
      throw new Error('expected a stored reset code')
    }
    await db.store(SEED_USER_IDS.alex, stored.codeHash, new Date(Date.now() - 1000))

    const confirm = await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({ email: 'alex@example.com', code, newPassword: NEW_PASSWORD })

    expect(confirm.status).toBe(401)
  })

  it('keeps only one active code: a new request invalidates the previous one', async () => {
    const firstCode = await requestCode('alex@example.com')
    const secondCode = await requestCode('alex@example.com')

    const withFirst = await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({ email: 'alex@example.com', code: firstCode, newPassword: NEW_PASSWORD })
    expect(withFirst.status).toBe(401)

    const withSecond = await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({ email: 'alex@example.com', code: secondCode, newPassword: NEW_PASSWORD })
    expect(withSecond.status).toBe(200)
  })

  it('isolates other users: resetting one account leaves another untouched', async () => {
    const samToken = await login(app, 'sam@example.com')
    const code = await requestCode('alex@example.com')

    await request(app.getHttpServer())
      .post('/auth/password/reset')
      .send({ email: 'alex@example.com', code, newPassword: NEW_PASSWORD })

    const samStillIn = await request(app.getHttpServer())
      .get('/conversations')
      .set('Authorization', `Bearer ${samToken}`)
    expect(samStillIn.status).toBe(200)

    const samLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'sam@example.com', password: SEED_PASSWORD })
    expect(samLogin.status).toBe(200)
  })
})
