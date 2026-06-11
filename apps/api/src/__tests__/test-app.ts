import 'reflect-metadata'
import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../app.module'
import { resetStore } from '../db/store'

// Shared dev/test password for every seeded account (see db/store.ts).
export const SEED_PASSWORD = 'password123'

// Matches the vitest-config env; low cost keeps the suite fast.
const TEST_BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? '4')

export async function createTestApp(): Promise<INestApplication> {
  resetStore(TEST_BCRYPT_ROUNDS)
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
  const app = moduleRef.createNestApplication()
  await app.init()
  return app
}

export async function login(
  app: INestApplication,
  email: string,
  password: string = SEED_PASSWORD,
): Promise<string> {
  const response = await request(app.getHttpServer()).post('/auth/login').send({ email, password })
  if (response.status !== 200) {
    throw new Error(`login failed: ${response.status} ${JSON.stringify(response.body)}`)
  }

  return (response.body as { token: string }).token
}
