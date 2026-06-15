import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

export type MessageDocument = HydratedDocument<Message>

@Schema()
export class Message {
  @Prop()
  conversationId!: string

  @Prop()
  senderId!: string

  @Prop()
  content!: string

  @Prop()
  createdAt!: string
}

export const MessageSchema = SchemaFactory.createForClass(Message)

MessageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 })
