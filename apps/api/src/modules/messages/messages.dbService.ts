import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Message } from '@chat/contract'
import type { Model } from 'mongoose'
import { Message as MessageModel, type MessageDocument } from './message.schema'

export type MessageDraft = Omit<Message, 'id'>

export type MessagePageCursor = {
  createdAt: string
  id: string
}

export type MessagePage = {
  messages: Message[]
  nextCursor: MessagePageCursor | null
}

function toMessage(doc: MessageDocument): Message {
  return {
    id: doc._id,
    conversationId: doc.conversationId,
    senderId: doc.senderId,
    content: doc.content,
    // Stored as a Date; the contract exposes an ISO string.
    createdAt: doc.createdAt.toISOString(),
  }
}

@Injectable()
export class MessagesDbService {
  constructor(
    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async getMessagePage(
    conversationId: string,
    limit: number,
    cursor?: MessagePageCursor,
  ): Promise<MessagePage> {
    const filter =
      cursor === undefined
        ? { conversationId }
        : {
            conversationId,
            // createdAt is a Date in the schema; convert the cursor's ISO string
            // explicitly instead of relying on Mongoose to cast the comparison.
            $or: [
              { createdAt: { $lt: new Date(cursor.createdAt) } },
              { createdAt: new Date(cursor.createdAt), _id: { $lt: cursor.id } },
            ],
          }

    const docsDesc = await this.messageModel
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .exec()

    const hasMore = docsDesc.length > limit
    const pageDesc = hasMore ? docsDesc.slice(0, limit) : docsDesc
    const oldestOnPage = pageDesc.at(-1)
    const nextCursor =
      hasMore && oldestOnPage !== undefined
        ? { createdAt: oldestOnPage.createdAt.toISOString(), id: oldestOnPage._id }
        : null

    return { messages: pageDesc.reverse().map(toMessage), nextCursor }
  }

  async create(draft: MessageDraft): Promise<Message> {
    const doc = await this.messageModel.create({
      _id: randomUUID(),
      conversationId: draft.conversationId,
      senderId: draft.senderId,
      content: draft.content,
      createdAt: new Date(draft.createdAt),
    })
    return toMessage(doc)
  }

  async reset(drafts: MessageDraft[]): Promise<void> {
    await this.messageModel.deleteMany({})
    if (drafts.length > 0) {
      await this.messageModel.insertMany(
        drafts.map((draft) => ({
          _id: randomUUID(),
          conversationId: draft.conversationId,
          senderId: draft.senderId,
          content: draft.content,
          createdAt: new Date(draft.createdAt),
        })),
      )
    }
  }
}
