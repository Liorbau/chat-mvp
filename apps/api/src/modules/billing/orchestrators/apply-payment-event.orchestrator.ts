import { Injectable, Logger } from '@nestjs/common'
import { UsersService } from '../../users/users.service'
import type { PaymentEvent } from '../payment/payment.provider'
import { PlansService } from '../plans/plans.service'
import { WebhookEventsDbService } from '../webhooks/webhook-events.dbService'

export type ApplyPaymentEventResult = {
  status: 'applied' | 'duplicate' | 'rejected'
}

@Injectable()
export class ApplyPaymentEventOrchestrator {
  private readonly logger = new Logger(ApplyPaymentEventOrchestrator.name)

  constructor(
    private readonly webhookEvents: WebhookEventsDbService,
    private readonly plansService: PlansService,
    private readonly usersService: UsersService,
  ) {}

  async execute(event: PaymentEvent): Promise<ApplyPaymentEventResult> {
    if (await this.webhookEvents.has(event.id)) {
      return { status: 'duplicate' }
    }
    const result =
      event.type === 'payment_failed'
        ? await this.applyFailure(event)
        : await this.applyCompletion(event)
    await this.webhookEvents.markProcessed(event)
    return result
  }

  private async applyCompletion(event: PaymentEvent): Promise<ApplyPaymentEventResult> {
    const plan = await this.plansService.getPurchasablePlan(event.planKey)
    if (event.amount !== plan.priceAmount || event.currency !== plan.currency) {
      this.logger.warn(
        `Rejected payment webhook '${event.id}': amount/currency mismatch for plan '${event.planKey}'.`,
      )
      return { status: 'rejected' }
    }
    await this.usersService.setSubscription(event.userId, {
      planKey: event.planKey,
      status: 'active',
    })
    return { status: 'applied' }
  }

  private async applyFailure(event: PaymentEvent): Promise<ApplyPaymentEventResult> {
    const user = await this.usersService.findById(event.userId)
    if (user?.subscription.planKey === 'pro' && user.subscription.status === 'active') {
      this.logger.warn(
        `Ignored payment_failed '${event.id}': user '${event.userId}' already has active Pro.`,
      )
      return { status: 'rejected' }
    }
    await this.usersService.setSubscription(event.userId, {
      planKey: 'free',
      status: 'failed',
    })
    return { status: 'applied' }
  }
}
