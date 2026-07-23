import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '../users/users.module'
import { UpgradeReturnController } from './account/upgrade-return.controller'
import { ApplyPaymentEventOrchestrator } from './orchestrators/apply-payment-event.orchestrator'
import { CreatePaymentSessionOrchestrator } from './orchestrators/create-payment-session.orchestrator'
import { ListPlansOrchestrator } from './orchestrators/list-plans.orchestrator'
import { ProcessPaymentWebhookOrchestrator } from './orchestrators/process-payment-webhook.orchestrator'
import { RedirectUpgradeReturnOrchestrator } from './orchestrators/redirect-upgrade-return.orchestrator'
import { PaymentModule } from './payment/payment.module'
import { Plan, PlanSchema } from './plans/plan.schema'
import { PlansController } from './plans/plans.controller'
import { PlansDbService } from './plans/plans.dbService'
import { PlansService } from './plans/plans.service'
import { PaymentWebhookWorker } from './queue/payment-webhook.worker'
import { QueueModule } from './queue/queue.module'
import { WebhookEvent, WebhookEventSchema } from './webhooks/webhook-event.schema'
import { WebhookEventsDbService } from './webhooks/webhook-events.dbService'
import { WebhooksController } from './webhooks/webhooks.controller'

@Module({
  imports: [
    PassportModule,
    PaymentModule,
    QueueModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
      { name: WebhookEvent.name, schema: WebhookEventSchema },
    ]),
  ],
  controllers: [PlansController, WebhooksController, UpgradeReturnController],
  providers: [
    PlansService,
    PlansDbService,
    WebhookEventsDbService,
    ListPlansOrchestrator,
    CreatePaymentSessionOrchestrator,
    ProcessPaymentWebhookOrchestrator,
    ApplyPaymentEventOrchestrator,
    RedirectUpgradeReturnOrchestrator,
    PaymentWebhookWorker,
  ],
  exports: [PlansDbService, PlansService],
})
export class BillingModule {}
