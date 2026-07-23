import { IsIn } from 'class-validator'
import type { CreatePaymentSessionRequest, PlanKey } from '@chat/contract'

const PLAN_KEYS: PlanKey[] = ['free', 'pro']

export class CreatePaymentSessionDto implements CreatePaymentSessionRequest {
  @IsIn(PLAN_KEYS)
  planKey!: PlanKey
}
