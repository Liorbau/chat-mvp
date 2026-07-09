import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { ConversationType } from '@chat/contract'
import type { HydratedDocument } from 'mongoose'

export type ConversationDocument = HydratedDocument<Conversation>

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Conversation {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, enum: ['user', 'assistant', 'tutor'], default: 'user' })
  type!: ConversationType

  @Prop({ type: [String], required: true })
  participantIds!: string[]

  @Prop()
  title?: string

  @Prop({ default: '' })
  lastMessagePreview!: string

  @Prop({ type: Date })
  lastMessageAt?: Date

  createdAt!: Date
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation)

// Backs "list my conversations sorted by last activity".
ConversationSchema.index({ participantIds: 1, lastMessageAt: -1 })

ConversationSchema.index(
  { participantIds: 1 },
  { unique: true, partialFilterExpression: { type: 'assistant' } },
)
ConversationSchema.index(
  { participantIds: 1 },
  { unique: true, partialFilterExpression: { type: 'tutor' }, name: 'tutor_participant_unique' },
)
