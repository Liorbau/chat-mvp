import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import type { PaymentEvent } from '../payment/payment.provider'
import {
  WebhookEvent as WebhookEventModel,
  type WebhookEventDocument,
} from './webhook-event.schema'

@Injectable()
export class WebhookEventsDbService {
  constructor(
    @InjectModel(WebhookEventModel.name)
    private readonly webhookEventModel: Model<WebhookEventDocument>,
  ) {}

  async has(eventId: string): Promise<boolean> {
    const existing = await this.webhookEventModel.exists({ _id: eventId }).exec()
    return existing != null
  }

  async markProcessed(event: PaymentEvent): Promise<boolean> {
    const existing = await this.webhookEventModel
      .findOneAndUpdate(
        { _id: event.id },
        {
          $setOnInsert: {
            type: event.type,
            userId: event.userId,
            processedAt: new Date(),
          },
        },
        { upsert: true, returnDocument: 'before' },
      )
      .exec()
    return existing == null
  }
}
