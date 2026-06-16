import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Conversation } from '@chat/contract'
import type { ClientSession, Model } from 'mongoose'
import type { SeedConversation } from '../../db/store'
import { Conversation as ConversationModel, type ConversationDocument } from './conversation.schema'

export type ConversationDraft = {
  participantIds: string[]
  title?: string
  lastMessagePreview: string
}

function toConversation(doc: ConversationDocument): Conversation {
  const base: Conversation = {
    id: doc._id,
    participantIds: doc.participantIds,
    lastMessagePreview: doc.lastMessagePreview,
    updatedAt: (doc.lastMessageAt ?? doc.createdAt).toISOString(),
  }
  return doc.title === undefined ? base : { ...base, title: doc.title }
}

@Injectable()
export class ConversationsDbService {
  constructor(
    @InjectModel(ConversationModel.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async findById(conversationId: string): Promise<Conversation | undefined> {
    const doc = await this.conversationModel.findById(conversationId).exec()
    return doc === null ? undefined : toConversation(doc)
  }

  async listByParticipant(userId: string): Promise<Conversation[]> {
    const docs = await this.conversationModel
      .find({ participantIds: userId })
      .sort({ lastMessageAt: -1 })
      .exec()
    return docs.map(toConversation)
  }

  async findDirectByParticipants(participantIds: string[]): Promise<Conversation | undefined> {
    const doc = await this.conversationModel
      .findOne({ participantIds: { $all: participantIds, $size: 2 } })
      .exec()
    return doc === null ? undefined : toConversation(doc)
  }

  async create(draft: ConversationDraft): Promise<Conversation> {
    const doc = await this.conversationModel.create({
      _id: randomUUID(),
      participantIds: draft.participantIds,
      lastMessagePreview: draft.lastMessagePreview,
      lastMessageAt: new Date(),
      ...(draft.title === undefined ? {} : { title: draft.title }),
    })
    return toConversation(doc)
  }

  async updateLastMessage(
    conversationId: string,
    lastMessagePreview: string,
    lastMessageAt: Date,
    session?: ClientSession,
  ): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: conversationId },
      { $set: { lastMessagePreview, lastMessageAt } },
      session ? { session } : {},
    )
  }

  async reset(conversations: SeedConversation[]): Promise<void> {
    await this.conversationModel.deleteMany({})
    if (conversations.length > 0) {
      await this.conversationModel.insertMany(
        conversations.map((conversation) => ({
          _id: conversation.id,
          participantIds: conversation.participantIds,
          lastMessagePreview: conversation.lastMessagePreview,
          lastMessageAt: conversation.lastMessageAt,
          ...(conversation.title === undefined ? {} : { title: conversation.title }),
        })),
      )
    }
  }
}
