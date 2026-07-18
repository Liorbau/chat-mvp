import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from '../auth/auth.module'
import { ConversationsModule } from '../conversations/conversations.module'
import { Message, MessageSchema } from './message.schema'
import { MessagesController } from './messages.controller'
import { MessagesDbService } from './messages.dbService'
import { MessagesService } from './messages.service'
import { GetMessagesOrchestrator } from './get-messages.orchestrator'
import { CreateMessageOrchestrator } from './create-message.orchestrator'

@Module({
  imports: [
    AuthModule,
    ConversationsModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessagesDbService,
    GetMessagesOrchestrator,
    CreateMessageOrchestrator,
  ],
  exports: [MessagesDbService, MessagesService],
})
export class MessagesModule {}
