import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Plan, User } from '@chat/contract'
import type { UsersService } from '../../users/users.service'
import type { PaymentEvent } from '../payment/payment.provider'
import type { PlansService } from '../plans/plans.service'
import type { WebhookEventsDbService } from '../webhooks/webhook-events.dbService'
import { ApplyPaymentEventOrchestrator } from './apply-payment-event.orchestrator'

const PRO_PLAN: Plan = { key: 'pro', name: 'Pro', priceAmount: 900, currency: 'USD' }

function paymentEvent(overrides: Partial<PaymentEvent> = {}): PaymentEvent {
  return {
    id: 'evt-1',
    type: 'payment_completed',
    userId: 'user-1',
    planKey: 'pro',
    amount: 900,
    currency: 'USD',
    ...overrides,
  }
}

function makeWebhookEvents(
  overrides: Partial<WebhookEventsDbService> = {},
): WebhookEventsDbService {
  return {
    has: vi.fn().mockResolvedValue(false),
    markProcessed: vi.fn().mockResolvedValue(true),
    ...overrides,
  } as unknown as WebhookEventsDbService
}

function makePlans(overrides: Partial<PlansService> = {}): PlansService {
  return {
    getPurchasablePlan: vi.fn().mockResolvedValue(PRO_PLAN),
    ...overrides,
  } as unknown as PlansService
}

function makeUsers(overrides: Partial<UsersService> = {}): UsersService {
  return {
    findById: vi.fn().mockResolvedValue({
      id: 'user-1',
      subscription: { planKey: 'free', status: 'none' },
    } as User),
    setSubscription: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as UsersService
}

describe('ApplyPaymentEventOrchestrator', () => {
  let webhookEvents: WebhookEventsDbService
  let plans: PlansService
  let users: UsersService
  let orchestrator: ApplyPaymentEventOrchestrator

  beforeEach(() => {
    webhookEvents = makeWebhookEvents()
    plans = makePlans()
    users = makeUsers()
    orchestrator = new ApplyPaymentEventOrchestrator(webhookEvents, plans, users)
  })

  it('grants pro then marks the event processed', async () => {
    const result = await orchestrator.execute(paymentEvent())

    expect(users.setSubscription).toHaveBeenCalledWith('user-1', {
      planKey: 'pro',
      status: 'active',
    })
    expect(webhookEvents.markProcessed).toHaveBeenCalledOnce()
    expect(webhookEvents.has).toHaveBeenCalledWith('evt-1')
    expect(result).toEqual({ status: 'applied' })
  })

  it('skips an already-processed event without touching the subscription', async () => {
    webhookEvents = makeWebhookEvents({ has: vi.fn().mockResolvedValue(true) })
    orchestrator = new ApplyPaymentEventOrchestrator(webhookEvents, plans, users)

    const result = await orchestrator.execute(paymentEvent())

    expect(plans.getPurchasablePlan).not.toHaveBeenCalled()
    expect(users.setSubscription).not.toHaveBeenCalled()
    expect(webhookEvents.markProcessed).not.toHaveBeenCalled()
    expect(result).toEqual({ status: 'duplicate' })
  })

  it('rejects a completed payment whose amount does not match the plan', async () => {
    const result = await orchestrator.execute(paymentEvent({ amount: 100 }))

    expect(users.setSubscription).not.toHaveBeenCalled()
    expect(webhookEvents.markProcessed).toHaveBeenCalledOnce()
    expect(result).toEqual({ status: 'rejected' })
  })

  it('rejects a completed payment whose currency does not match the plan', async () => {
    const result = await orchestrator.execute(paymentEvent({ currency: 'EUR' }))

    expect(users.setSubscription).not.toHaveBeenCalled()
    expect(result).toEqual({ status: 'rejected' })
  })

  it('marks the subscription failed on a failed payment without an amount check', async () => {
    const result = await orchestrator.execute(paymentEvent({ type: 'payment_failed' }))

    expect(plans.getPurchasablePlan).not.toHaveBeenCalled()
    expect(users.setSubscription).toHaveBeenCalledWith('user-1', {
      planKey: 'free',
      status: 'failed',
    })
    expect(result).toEqual({ status: 'applied' })
  })

  it('does not downgrade an active pro subscription on a later failed payment', async () => {
    users = makeUsers({
      findById: vi.fn().mockResolvedValue({
        id: 'user-1',
        subscription: { planKey: 'pro', status: 'active' },
      } as User),
    })
    orchestrator = new ApplyPaymentEventOrchestrator(webhookEvents, plans, users)

    const result = await orchestrator.execute(paymentEvent({ type: 'payment_failed' }))

    expect(users.setSubscription).not.toHaveBeenCalled()
    expect(webhookEvents.markProcessed).toHaveBeenCalledOnce()
    expect(result).toEqual({ status: 'rejected' })
  })

  it('does not mark the event when applying the subscription throws so the job can retry', async () => {
    users = makeUsers({
      setSubscription: vi.fn().mockRejectedValue(new Error('db down')),
    })
    orchestrator = new ApplyPaymentEventOrchestrator(webhookEvents, plans, users)

    await expect(orchestrator.execute(paymentEvent())).rejects.toThrow('db down')
    expect(webhookEvents.markProcessed).not.toHaveBeenCalled()
  })
})
