import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import type { Conversation, User } from '@chat/contract'
import { CurrentUser } from '../../common/decorators/current.user.decorator'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { CreateConversationDto } from './dto/create.conversation.dto'
import { ListConversationsOrchestrator } from './list-conversations.orchestrator'
import { CreateConversationOrchestrator } from './create-conversation.orchestrator'

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(
    private readonly listConversationsOrchestrator: ListConversationsOrchestrator,
    private readonly createConversationOrchestrator: CreateConversationOrchestrator,
  ) {}

  @Get()
  async list(@CurrentUser() user: User): Promise<Conversation[]> {
    return this.listConversationsOrchestrator.execute(user.id)
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() body: CreateConversationDto,
  ): Promise<Conversation> {
    return this.createConversationOrchestrator.execute(body, user.id)
  }
}
