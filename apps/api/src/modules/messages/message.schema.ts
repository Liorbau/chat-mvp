import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
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
}

export const MessageSchema = SchemaFactory.createForClass(Message)

MessageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 })
