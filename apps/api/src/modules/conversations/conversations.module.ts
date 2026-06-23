import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { Conversation, ConversationSchema } from './conversation.schema'
import { ConversationsController } from './conversations.controller'
import { ConversationsDbService } from './conversations.dbService'
import { ConversationsService } from './conversations.service'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsDbService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
