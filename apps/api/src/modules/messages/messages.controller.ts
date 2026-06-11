import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import type { GetMessagesResponse, SendMessageResponse, User } from '@chat/contract'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CreateMessageDto } from './dto/create-message.dto'
import { ConversationParamsDto, ListMessagesQueryDto } from './dto/list-messages.dto'
import { MessagesService } from './messages.service'

@Controller('conversations/:id/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  list(
    @Param() params: ConversationParamsDto,
    @Query() query: ListMessagesQueryDto,
    @CurrentUser() user: User,
  ): GetMessagesResponse {
    return this.messagesService.listMessages({
      conversationId: params.id,
      requesterId: user.id,
      cursor: query.cursor,
      limit: query.limit,
    })
  }

  @Post()
  create(
    @Param() params: ConversationParamsDto,
    @Body() body: CreateMessageDto,
    @CurrentUser() user: User,
  ): SendMessageResponse {
    return this.messagesService.createMessage({
      conversationId: params.id,
      requesterId: user.id,
      content: body.content,
    })
  }
}
