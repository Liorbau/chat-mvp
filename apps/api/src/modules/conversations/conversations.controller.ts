import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import type { Conversation, User } from '@chat/contract'
import type { Response } from 'express'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ConversationsService } from './conversations.service'
import { CreateConversationDto } from './dto/create-conversation.dto'

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  list(@CurrentUser() user: User): Conversation[] {
    return this.conversationsService.listConversations(user.id)
  }

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() body: CreateConversationDto,
    @Res({ passthrough: true }) response: Response,
  ): Conversation {
    const conversation = this.conversationsService.createConversation(body, user.id)
    response.setHeader('Location', `/conversations/${conversation.id}`)
    return conversation
  }
}
