import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'
import type { PaymentEventType } from '../payment/payment.provider'

export type WebhookEventDocument = HydratedDocument<WebhookEvent>

@Schema({ collection: 'webhook_events' })
export class WebhookEvent {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true })
  type!: PaymentEventType

  @Prop({ type: String, required: true })
  userId!: string

  @Prop({ type: Date, required: true, default: (): Date => new Date() })
  processedAt!: Date
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent)
