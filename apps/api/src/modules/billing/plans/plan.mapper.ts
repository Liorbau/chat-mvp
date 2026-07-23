import type { Plan } from '@chat/contract'
import type { PlanDocument } from './plan.schema'

export function toPlan(doc: PlanDocument): Plan {
  return {
    key: doc._id,
    name: doc.name,
    priceAmount: doc.priceAmount,
    currency: doc.currency,
  }
}
