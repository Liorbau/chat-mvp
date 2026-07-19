import { Body, Controller, Param, Post, Res, UseGuards } from '@nestjs/common'
import type { User } from '@chat/contract'
import type { Response } from 'express'
import { CurrentUser } from '../../common/decorators/current.user.decorator'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { CreateMessageDto } from '../messages/dto/create.message.dto'
import { ConversationParamsDto } from '../messages/dto/list.messages.dto'
import { StreamAgentReplyOrchestrator } from './orchestrators/stream-agent-reply.orchestrator'

@Controller('ai/conversations/:id/messages')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly streamAgentReplyOrchestrator: StreamAgentReplyOrchestrator) {}

  @Post()
  async stream(
    @Param() params: ConversationParamsDto,
    @Body() body: CreateMessageDto,
    @CurrentUser() user: User,
    @Res() response: Response,
  ): Promise<void> {
    const { userMessage, stream } = await this.streamAgentReplyOrchestrator.execute({
      conversationId: params.id,
      requesterId: user.id,
      content: body.content,
    })

    response.setHeader('Content-Type', 'text/event-stream')
    response.setHeader('Cache-Control', 'no-cache, no-transform')
    response.setHeader('Connection', 'keep-alive')
    response.flushHeaders()

    response.write(`data: ${JSON.stringify({ type: 'user_message', message: userMessage })}\n\n`)

    for await (const event of stream) {
      response.write(`data: ${JSON.stringify(event)}\n\n`)
    }
    response.end()
  }
}
