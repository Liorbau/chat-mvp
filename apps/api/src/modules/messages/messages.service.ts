import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import {
  ASSISTANT_SENDER_ID,
  type Citation,
  type GetMessagesResponse,
  type Message,
} from '@chat/contract'
import type { Connection } from 'mongoose'
import { ConversationsService } from '../conversations/conversations.service'
import { MessagesDbService } from './messages.dbService'
import { decodeCursor, encodeCursor } from './lib/messages.cursor'

type SendMessageInput = {
  conversationId: string
  senderId: string
  content: string
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesDbService: MessagesDbService,
    private readonly conversationsService: ConversationsService,
    // Used only to run the message-send writes in one transaction.
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async getPage(
    conversationId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<GetMessagesResponse> {
    const page = await this.messagesDbService.getMessagePage(
      conversationId,
      limit,
      decodeCursor(cursor),
    )

    return {
      messages: page.messages,
      nextCursor: page.nextCursor == null ? null : encodeCursor(page.nextCursor),
    }
  }

  // Atomic send: insert the message and update the conversation's last-message
  // snapshot in one transaction. Authorization is the caller's responsibility.
  async sendMessage(input: SendMessageInput): Promise<Message> {
    const occurredAt = new Date()
    const createdAt = occurredAt.toISOString()
    return this.connection.transaction(async (session) => {
      const created = await this.messagesDbService.create(
        {
          conversationId: input.conversationId,
          senderId: input.senderId,
          content: input.content,
          createdAt,
        },
        session,
      )
      await this.conversationsService.recordMessageActivity(
        input.conversationId,
        created.content,
        occurredAt,
        session,
      )
      return created
    })
  }

  async appendAssistantMessage(
    conversationId: string,
    content: string,
    citations?: Citation[],
  ): Promise<Message> {
    const occurredAt = new Date()
    const createdAt = occurredAt.toISOString()
    return this.connection.transaction(async (session) => {
      const created = await this.messagesDbService.create(
        {
          conversationId,
          senderId: ASSISTANT_SENDER_ID,
          content,
          createdAt,
          ...(citations === undefined ? {} : { citations }),
        },
        session,
      )
      await this.conversationsService.recordMessageActivity(
        conversationId,
        created.content,
        occurredAt,
        session,
      )
      return created
    })
  }
}
