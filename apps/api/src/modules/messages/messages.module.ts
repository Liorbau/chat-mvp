import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { ConversationsModule } from '../conversations/conversations.module'
import { MessagesController } from './messages.controller'
import { MessagesDbService } from './messages.dbService'
import { MessagesService } from './messages.service'

@Module({
  imports: [AuthModule, ConversationsModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesDbService],
})
export class MessagesModule {}
