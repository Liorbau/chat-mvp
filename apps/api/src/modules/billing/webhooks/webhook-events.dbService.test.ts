import { describe, expect, it, vi } from 'vitest'
import type { Model } from 'mongoose'
import type { PaymentEvent } from '../payment/payment.provider'
import type { WebhookEventDocument } from './webhook-event.schema'
import { WebhookEventsDbService } from './webhook-events.dbService'

function event(): PaymentEvent {
  return {
    id: 'evt-1',
    type: 'payment_completed',
    userId: 'user-1',
    planKey: 'pro',
    amount: 900,
    currency: 'USD',
  }
}

function makeService(model: Partial<Model<WebhookEventDocument>>): WebhookEventsDbService {
  return new WebhookEventsDbService(model as unknown as Model<WebhookEventDocument>)
}

describe('WebhookEventsDbService', () => {
  describe('has', () => {
    it('returns true when an event id exists', async () => {
      const exists = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ _id: 'evt-1' }),
      })
      const service = makeService({ exists })

      await expect(service.has('evt-1')).resolves.toBe(true)
    })

    it('returns false when an event id is missing', async () => {
      const exists = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      })
      const service = makeService({ exists })

      await expect(service.has('evt-1')).resolves.toBe(false)
    })
  })

  describe('markProcessed', () => {
    it('returns true when the upsert inserts a new claim', async () => {
      const findOneAndUpdate = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      })
      const service = makeService({ findOneAndUpdate })

      await expect(service.markProcessed(event())).resolves.toBe(true)
      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'evt-1' },
        {
          $setOnInsert: {
            type: 'payment_completed',
            userId: 'user-1',
            processedAt: expect.any(Date),
          },
        },
        { upsert: true, returnDocument: 'before' },
      )
    })

    it('returns false when the event id was already claimed', async () => {
      const findOneAndUpdate = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ _id: 'evt-1' }),
      })
      const service = makeService({ findOneAndUpdate })

      await expect(service.markProcessed(event())).resolves.toBe(false)
    })
  })
})
