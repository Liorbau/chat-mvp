import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import type { GetMessagesResponse, SendMessageResponse, User } from '@chat/contract'
import { CurrentUser } from '../../common/decorators/current.user.decorator'
import { JwtAuthGuard } from '../auth/jwt/jwt.auth.guard'
import { CreateMessageDto } from './dto/create.message.dto'
import { ConversationParamsDto, ListMessagesQueryDto } from './dto/list.messages.dto'
import { GetMessagesOrchestrator } from './orchestrators/get-messages.orchestrator'
import { CreateMessageOrchestrator } from './orchestrators/create-message.orchestrator'

@Controller('conversations/:id/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly getMessagesOrchestrator: GetMessagesOrchestrator,
    private readonly createMessageOrchestrator: CreateMessageOrchestrator,
  ) {}

  @Get()
  async list(
    @Param() params: ConversationParamsDto,
    @Query() query: ListMessagesQueryDto,
    @CurrentUser() user: User,
  ): Promise<GetMessagesResponse> {
    return this.getMessagesOrchestrator.execute(params.id, user.id, query.cursor, query.limit)
  }

  @Post()
  async create(
    @Param() params: ConversationParamsDto,
    @Body() body: CreateMessageDto,
    @CurrentUser() user: User,
  ): Promise<SendMessageResponse> {
    return this.createMessageOrchestrator.execute(params.id, user.id, body.content)
  }
}
