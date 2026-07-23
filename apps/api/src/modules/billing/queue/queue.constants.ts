import type { JobsOptions } from 'bullmq'

export const PAYMENT_WEBHOOK_QUEUE_NAME = 'payment-webhooks'
export const PAYMENT_WEBHOOK_DLQ_NAME = 'payment-webhooks-dlq'
export const PAYMENT_WEBHOOK_JOB = 'process'

export const PAYMENT_WEBHOOK_JOB_OPTIONS: JobsOptions = {
  attempts: 5,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: true,
  removeOnFail: false,
}
