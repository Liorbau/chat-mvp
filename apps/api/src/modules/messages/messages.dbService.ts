import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Message } from '@chat/contract'
import type { ClientSession, Model } from 'mongoose'
import { Message as MessageModel, type MessageDocument } from './message.schema'

export type MessageDraft = Omit<Message, 'id'>

// One $group bucket from listRecentForConversations' aggregation.
type ConversationMessageGroup = { docs: MessageDocument[] }

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
    createdAt: doc.createdAt.toISOString(),
  }
}

function toMessageDocument(draft: MessageDraft) {
  return {
    _id: randomUUID(),
    conversationId: draft.conversationId,
    senderId: draft.senderId,
    content: draft.content,
    createdAt: new Date(draft.createdAt),
  }
}

function buildPageFilter(conversationId: string, cursor?: MessagePageCursor) {
  if (cursor === undefined) {
    return { conversationId }
  }

  const cursorCreatedAt = new Date(cursor.createdAt)
  return {
    conversationId,
    $or: [
      { createdAt: { $lt: cursorCreatedAt } },
      { createdAt: cursorCreatedAt, _id: { $lt: cursor.id } },
    ],
  }
}

function toMessagePage(docsDesc: MessageDocument[], limit: number): MessagePage {
  const hasMore = docsDesc.length > limit
  const pageDesc = hasMore ? docsDesc.slice(0, limit) : docsDesc
  const oldestOnPage = pageDesc.at(-1)
  const nextCursor =
    hasMore && oldestOnPage !== undefined
      ? { createdAt: oldestOnPage.createdAt.toISOString(), id: oldestOnPage._id }
      : null

  return { messages: pageDesc.reverse().map(toMessage), nextCursor }
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

  async reset(drafts: MessageDraft[]): Promise<void> {
    await this.messageModel.deleteMany({})
    if (drafts.length > 0) {
      await this.messageModel.insertMany(drafts.map(toMessageDocument))
    }
  }
}
