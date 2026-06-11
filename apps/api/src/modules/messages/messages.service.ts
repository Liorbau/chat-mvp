import { Injectable } from '@nestjs/common'
import type { GetMessagesResponse, Message, SendMessageResponse } from '@chat/contract'
import { z } from 'zod'
import { AppError } from '../../errors/AppError'
import { ConversationsService } from '../conversations/conversations.service'
import { DEFAULT_LIMIT, MAX_LIMIT } from './dto/list-messages.dto'
import { MessagesDbService } from './messages.dbService'

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

type CursorKey = {
  createdAt: string
  id: string
}

const cursorKeySchema = z.object({
  createdAt: z.string().min(1),
  id: z.string().min(1),
})

function encodeCursor(key: CursorKey): string {
  return Buffer.from(`${key.createdAt}|${key.id}`, 'utf8').toString('base64')
}

function decodeCursor(cursor: string | undefined): CursorKey | undefined {
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
      id.length === 0 ||
      extra !== undefined
    ) {
      throw new Error('Invalid cursor')
    }
    const parsedKey = cursorKeySchema.safeParse({ createdAt, id })
    if (!parsedKey.success) {
      throw new Error('Invalid cursor')
    }

    return parsedKey.data
  } catch {
    throw AppError.badRequest('VALIDATION_ERROR', 'Invalid request', [
      { path: ['cursor'], message: 'cursor is invalid' },
    ])
  }
}

function compareMessageDesc(left: Message, right: Message): number {
  const createdAtCompare = right.createdAt.localeCompare(left.createdAt)
  if (createdAtCompare !== 0) {
    return createdAtCompare
  }

  return right.id.localeCompare(left.id)
}

function isOlderThanCursor(message: Message, cursor: CursorKey): boolean {
  if (message.createdAt < cursor.createdAt) {
    return true
  }
  if (message.createdAt > cursor.createdAt) {
    return false
  }

  return message.id < cursor.id
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesDbService: MessagesDbService,
    private readonly conversationsService: ConversationsService,
  ) {}

  listMessages(input: ListMessagesInput): GetMessagesResponse {
    this.conversationsService.assertParticipant(input.conversationId, input.requesterId)

    const limit = input.limit > 0 ? Math.min(input.limit, MAX_LIMIT) : DEFAULT_LIMIT
    const cursor = decodeCursor(input.cursor)

    const sortedDesc = this.messagesDbService
      .listByConversationId(input.conversationId)
      .sort(compareMessageDesc)
      .filter((message) => {
        if (cursor === undefined) {
          return true
        }

        return isOlderThanCursor(message, cursor)
      })

    const pageDesc = sortedDesc.slice(0, limit)
    const pageAsc = [...pageDesc].reverse()
    const lastPageItem = pageDesc.at(-1)
    const nextCursor =
      pageDesc.length < limit || lastPageItem === undefined
        ? null
        : encodeCursor({ createdAt: lastPageItem.createdAt, id: lastPageItem.id })

    return { messages: pageAsc, nextCursor }
  }

  createMessage(input: CreateMessageInput): SendMessageResponse {
    this.conversationsService.assertParticipant(input.conversationId, input.requesterId)

    const createdAt = new Date().toISOString()
    const message = this.messagesDbService.create({
      conversationId: input.conversationId,
      senderId: input.requesterId,
      content: input.content,
      createdAt,
    })

    this.conversationsService.recordMessageActivity(
      input.conversationId,
      message.content,
      createdAt,
    )

    return { message }
  }
}
