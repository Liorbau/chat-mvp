import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import type { Conversation, User } from '@chat/contract'
import { CurrentUser } from '../../common/decorators/current.user.decorator'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { ConversationsService } from './conversations.service'
import { CreateConversationDto } from './dto/create.conversation.dto'

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async list(@CurrentUser() user: User): Promise<Conversation[]> {
    return this.conversationsService.listConversations(user.id)
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() body: CreateConversationDto,
  ): Promise<Conversation> {
    return this.conversationsService.createConversation(body, user.id)
  }
}
