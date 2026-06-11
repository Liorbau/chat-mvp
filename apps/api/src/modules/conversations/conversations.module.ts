import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { ConversationsController } from './conversations.controller'
import { ConversationsDbService } from './conversations.dbService'
import { ConversationsService } from './conversations.service'

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsDbService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
