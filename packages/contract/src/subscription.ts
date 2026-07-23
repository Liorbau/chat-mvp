export type PlanKey = 'free' | 'pro'

export type SubscriptionStatus = 'none' | 'active' | 'failed'

export type Plan = {
  key: PlanKey
  name: string
  priceAmount: number
  currency: string
}

export type Subscription = {
  planKey: PlanKey
  status: SubscriptionStatus
}

export type ListPlansResponse = {
  plans: Plan[]
}

export type CreatePaymentSessionRequest = {
  planKey: PlanKey
}

export type PaymentSessionResponse = {
  redirectUrl: string
}
