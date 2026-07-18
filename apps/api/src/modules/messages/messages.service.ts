import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import {
  ASSISTANT_SENDER_ID,
  type Citation,
  type GetMessagesResponse,
  type Message,
} from '@chat/contract'
import type { Connection } from 'mongoose'
import { AppError } from '../../errors/AppError'
import { ConversationsService } from '../conversations/conversations.service'
import { MessagesDbService, type MessagePageCursor } from './messages.dbService'

type SendMessageInput = {
  conversationId: string
  senderId: string
  content: string
}

// The cursor id is a message's uuid `_id`.
const CURSOR_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function encodeCursor(key: MessagePageCursor): string {
  return Buffer.from(`${key.createdAt}|${key.id}`, 'utf8').toString('base64')
}

function decodeCursor(cursor: string | undefined): MessagePageCursor | undefined {
  if (cursor === undefined) {
    return undefined
  }

  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8')
    const [createdAt, id, extra] = decoded.split('|')
    if (
      createdAt === undefined ||
      createdAt.length === 0 ||
      id === undefined ||
      !CURSOR_ID_PATTERN.test(id) ||
      extra !== undefined
    ) {
      throw new Error('Invalid cursor')
    }

    return { createdAt, id }
  } catch {
    throw AppError.badRequest('VALIDATION_ERROR', 'Invalid request', [
      { path: ['cursor'], message: 'cursor is invalid' },
    ])
  }
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
      nextCursor: page.nextCursor === null ? null : encodeCursor(page.nextCursor),
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
