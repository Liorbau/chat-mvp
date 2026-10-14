import { Injectable } from '@nestjs/common'
import type { GetMessagesResponse, Message } from '@chat/contract'
import type { ClientSession } from 'mongoose'
import { MessagesDbService, type MessageDraft } from './messages.dbService'
import { decodeCursor, encodeCursor } from './lib/messages.cursor'

export type NewMessage = Omit<MessageDraft, 'createdAt'>

@Injectable()
export class MessagesService {
  constructor(private readonly messagesDbService: MessagesDbService) {}

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

  async createMessage(message: NewMessage, session: ClientSession): Promise<Message> {
    return this.messagesDbService.create(
      { ...message, createdAt: new Date().toISOString() },
      session,
    )
  }
}
