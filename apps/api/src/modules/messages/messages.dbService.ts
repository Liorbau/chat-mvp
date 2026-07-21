import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Message } from '@chat/contract'
import type { ClientSession, Model } from 'mongoose'
import { Message as MessageModel, type MessageDocument } from './message.schema'
import {
  buildPageFilter,
  toMessage,
  toMessageDocument,
  toMessagePage,
  type MessageDraft,
  type MessagePage,
  type MessagePageCursor,
} from './lib/messages.mappers'

export type { MessageDraft, MessagePage, MessagePageCursor } from './lib/messages.mappers'

// One $group bucket from listRecentForConversations' aggregation.
type ConversationMessageGroup = { docs: MessageDocument[] }

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
    const docsDesc = await this.messageModel
      .find(buildPageFilter(conversationId, cursor))
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .exec()

    return toMessagePage(docsDesc, limit)
  }

  async create(draft: MessageDraft, session?: ClientSession): Promise<Message> {
    const [doc] = await this.messageModel.create(
      [toMessageDocument(draft)],
      session ? { session } : {},
    )
    if (doc === undefined) {
      throw new Error('Failed to create message')
    }
    return toMessage(doc)
  }

  // Most recent `limit` messages, returned oldest-first for LLM context.
  async listRecent(conversationId: string, limit: number): Promise<Message[]> {
    const docsDesc = await this.messageModel
      .find({ conversationId })
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .exec()
    return docsDesc.reverse().map(toMessage)
  }

  async listRecentForConversations(
    conversationIds: string[],
    perConversationLimit: number,
  ): Promise<Message[]> {
    if (conversationIds.length === 0) {
      return []
    }
    const groups = await this.messageModel
      .aggregate<ConversationMessageGroup>([
        { $match: { conversationId: { $in: conversationIds } } },
        { $sort: { createdAt: -1, _id: -1 } },
        { $group: { _id: '$conversationId', docs: { $push: '$$ROOT' } } },
        { $project: { docs: { $slice: ['$docs', perConversationLimit] } } },
      ])
      .exec()
    return groups.flatMap((group) => group.docs.map(toMessage))
  }

  async reset(drafts: MessageDraft[]): Promise<number> {
    await this.messageModel.deleteMany({})
    if (drafts.length === 0) {
      return 0
    }
    const inserted = await this.messageModel.insertMany(drafts.map(toMessageDocument))
    return inserted.length
  }
}
