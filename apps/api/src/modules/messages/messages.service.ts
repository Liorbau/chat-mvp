import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import {
  ASSISTANT_SENDER_ID,
  type Citation,
  type GetMessagesResponse,
  type Message,
  type SendMessageResponse,
} from '@chat/contract'
import type { Connection } from 'mongoose'
import { AppError } from '../../errors/AppError'
import { ConversationsService } from '../conversations/conversations.service'
import { MessagesDbService, type MessagePageCursor } from './messages.dbService'

type ListMessagesInput = {
  conversationId: string
  requesterId: string
  cursor: string | undefined
  limit: number
}

type CreateMessageInput = {
  conversationId: string
  requesterId: string
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

  async listMessages(input: ListMessagesInput): Promise<GetMessagesResponse> {
    await this.conversationsService.assertParticipant(input.conversationId, input.requesterId)

    const limit = input.limit
    const cursor = decodeCursor(input.cursor)

    const page = await this.messagesDbService.getMessagePage(input.conversationId, limit, cursor)

    return {
      messages: page.messages,
      nextCursor: page.nextCursor === null ? null : encodeCursor(page.nextCursor),
    }
  }

  async createMessage(input: CreateMessageInput): Promise<SendMessageResponse> {
    const conversation = await this.conversationsService.assertParticipant(
      input.conversationId,
      input.requesterId,
    )
    if (conversation.type === 'assistant') {
      throw AppError.badRequest(
        'VALIDATION_ERROR',
        'Use the assistant endpoint to message an assistant conversation',
      )
    }

    const occurredAt = new Date()
    const createdAt = occurredAt.toISOString()
    const message = await this.connection.transaction(async (session) => {
      const created = await this.messagesDbService.create(
        {
          conversationId: input.conversationId,
          senderId: input.requesterId,
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

    return { message }
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
