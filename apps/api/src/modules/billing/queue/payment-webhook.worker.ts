import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { type Job, Queue, Worker } from 'bullmq'
import Redis from 'ioredis'
import type { QueueDriver } from '../../../config/env.validation'
import {
  ApplyPaymentEventOrchestrator,
  type ApplyPaymentEventResult,
} from '../orchestrators/apply-payment-event.orchestrator'
import type { PaymentEvent } from '../payment/payment.provider'
import {
  PAYMENT_WEBHOOK_DLQ_NAME,
  PAYMENT_WEBHOOK_JOB,
  PAYMENT_WEBHOOK_JOB_OPTIONS,
  PAYMENT_WEBHOOK_QUEUE_NAME,
} from './queue.constants'

@Injectable()
export class PaymentWebhookWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentWebhookWorker.name)
  private worker: Worker<PaymentEvent, ApplyPaymentEventResult> | null = null
  private deadLetter: Queue<PaymentEvent> | null = null
  private workerConnection: Redis | null = null
  private deadLetterConnection: Redis | null = null

  constructor(
    private readonly config: ConfigService,
    private readonly applyPaymentEvent: ApplyPaymentEventOrchestrator,
  ) {}

  onModuleInit(): void {
    if (this.config.getOrThrow<QueueDriver>('QUEUE_DRIVER') !== 'bullmq') {
      return
    }
    const redisUrl = this.config.getOrThrow<string>('REDIS_URL')
    this.workerConnection = new Redis(redisUrl, { maxRetriesPerRequest: null })
    this.deadLetterConnection = new Redis(redisUrl, { maxRetriesPerRequest: null })
    this.deadLetter = new Queue(PAYMENT_WEBHOOK_DLQ_NAME, { connection: this.deadLetterConnection })
    this.worker = new Worker<PaymentEvent, ApplyPaymentEventResult>(
      PAYMENT_WEBHOOK_QUEUE_NAME,
      (job) => this.applyPaymentEvent.execute(job.data),
      { connection: this.workerConnection },
    )
    this.worker.on('failed', (job, error) => {
      this.deadLetterExhausted(job, error).catch((moveError: unknown) => {
        this.logger.error(`Failed to move job to DLQ: ${String(moveError)}`)
      })
    })
  }

  private async deadLetterExhausted(
    job: Job<PaymentEvent> | undefined,
    error: Error,
  ): Promise<string | null> {
    if (job == null || this.deadLetter == null) {
      return null
    }
    const attempts = job.opts.attempts ?? PAYMENT_WEBHOOK_JOB_OPTIONS.attempts ?? 1
    if (job.attemptsMade < attempts) {
      return null
    }
    const dead = await this.deadLetter.add(PAYMENT_WEBHOOK_JOB, job.data)
    this.logger.error(
      `Payment webhook '${job.data.id}' exhausted ${attempts} attempts; moved to DLQ (job ${dead.id}). ${error.message}`,
    )
    return dead.id ?? null
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close()
    await this.deadLetter?.close()
    await this.workerConnection?.quit()
    await this.deadLetterConnection?.quit()
  }
}
