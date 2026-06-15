import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Message } from '@chat/contract'
import { Types } from 'mongoose'
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
    id: doc._id.toString(),
    conversationId: doc.conversationId,
    senderId: doc.senderId,
    content: doc.content,
    createdAt: doc.createdAt,
  }
}

@Injectable()
export class MessagesDbService {
  constructor(
    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async listByConversationId(conversationId: string): Promise<Message[]> {
    const docs = await this.messageModel.find({ conversationId }).exec()
    return docs.map(toMessage)
  }

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
            $or: [
              { createdAt: { $lt: cursor.createdAt } },
              { createdAt: cursor.createdAt, _id: { $lt: new Types.ObjectId(cursor.id) } },
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
        ? { createdAt: oldestOnPage.createdAt, id: oldestOnPage._id.toString() }
        : null

    return { messages: pageDesc.reverse().map(toMessage), nextCursor }
  }

  async create(draft: MessageDraft): Promise<Message> {
    const doc = await this.messageModel.create({
      conversationId: draft.conversationId,
      senderId: draft.senderId,
      content: draft.content,
      createdAt: draft.createdAt,
    })
    return toMessage(doc)
  }

  async reset(drafts: MessageDraft[]): Promise<void> {
    await this.messageModel.deleteMany({})
    if (drafts.length > 0) {
      await this.messageModel.insertMany(drafts)
    }
  }
}
