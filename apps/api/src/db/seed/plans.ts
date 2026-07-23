import type { Plan } from '@chat/contract'

export const seedPlans: Plan[] = [
  { key: 'free', name: 'Free', priceAmount: 0, currency: 'USD' },
  { key: 'pro', name: 'Pro', priceAmount: 900, currency: 'USD' },
]
