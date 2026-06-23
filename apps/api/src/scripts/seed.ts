import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { buildSeedUsers, seedConversations, seedMessageDrafts } from '../db/store'
import { ConversationsDbService } from '../modules/conversations/conversations.dbService'
import { MessagesDbService } from '../modules/messages/messages.dbService'
import { UsersDbService } from '../modules/users/users.dbService'

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule)
  try {
    const bcryptRounds = app.get(ConfigService).getOrThrow<number>('BCRYPT_ROUNDS')
    const users = buildSeedUsers(bcryptRounds)
    await app.get(UsersDbService).reset(users)
    await app.get(ConversationsDbService).reset(seedConversations)
    await app.get(MessagesDbService).reset(seedMessageDrafts)
    console.log(
      `Seeded ${users.length} users, ${seedConversations.length} conversations, ` +
        `${seedMessageDrafts.length} messages.`,
    )
  } finally {
    await app.close()
  }
}

void seed()
