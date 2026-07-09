import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { Citation } from '@chat/contract'
import type { HydratedDocument } from 'mongoose'

export type MessageDocument = HydratedDocument<Message>

@Schema()
export class Message {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ required: true })
  conversationId!: string

  @Prop({ required: true })
  senderId!: string

  @Prop({ required: true })
  content!: string

  @Prop({ type: Date, required: true })
  createdAt!: Date

  // Present only on tutor answers: the retrieved sources the answer cited.
  // Stored as-is (never queried into), so a plain object array is enough.
  @Prop({ type: [Object], default: undefined })
  citations?: Citation[]
}

export const MessageSchema = SchemaFactory.createForClass(Message)

MessageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 })
