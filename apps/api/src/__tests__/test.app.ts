import 'reflect-metadata'
import type { INestApplication } from '@nestjs/common'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../app.module'
import { JSON_BODY_LIMIT } from '../config/http.constants'
import { buildSeedUsers, seedConversations, seedMessageDrafts, SEED_PASSWORD } from '../db/store'
import { ConversationsDbService } from '../modules/conversations/conversations.dbService'
import { MessagesDbService } from '../modules/messages/messages.dbService'
import { UsersDbService } from '../modules/users/users.dbService'

// Re-exported from the store so the seed password has a single source of truth.
export { SEED_PASSWORD }

// Matches the vitest-config env; low cost keeps the suite fast.
const TEST_BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? '4')

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
  // Mirror the runtime bootstrap so tests enforce the same body-size limit.
  const app = moduleRef.createNestApplication<NestExpressApplication>()
  app.useBodyParser('json', { limit: JSON_BODY_LIMIT })
  await app.init()
  await app.get(UsersDbService).reset(buildSeedUsers(TEST_BCRYPT_ROUNDS))
  await app.get(ConversationsDbService).reset(seedConversations)
  await app.get(MessagesDbService).reset(seedMessageDrafts)
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
