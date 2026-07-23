import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { buildSeedUsers, seedConversations, seedMessageDrafts, seedPlans } from '../db/store'
import { PlansDbService } from '../modules/billing/plans/plans.dbService'
import { ConversationsDbService } from '../modules/conversations/conversations.dbService'
import { MessagesDbService } from '../modules/messages/messages.dbService'
import { UsersDbService } from '../modules/users/users.dbService'

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule)
  try {
    await app.get(PlansDbService).ensureSeeded(seedPlans)
    console.log(`Ensured ${seedPlans.length} plans (${seedPlans.map((p) => p.key).join(', ')}).`)

    const existingUsers = await app.get(UsersDbService).list()
    if (existingUsers.length > 0) {
      console.log(`Skipping seed: database already has ${existingUsers.length} users.`)
      return
    }

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
