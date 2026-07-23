import { Injectable } from '@nestjs/common'
import type { Plan, PlanKey } from '@chat/contract'
import { AppError } from '../../../errors/AppError'
import { PlansDbService } from './plans.dbService'

@Injectable()
export class PlansService {
  constructor(private readonly plansDb: PlansDbService) {}

  listPlans(): Promise<Plan[]> {
    return this.plansDb.listAll()
  }

  async getPurchasablePlan(planKey: PlanKey): Promise<Plan> {
    const plan = await this.plansDb.findByKey(planKey)
    if (plan == null) {
      throw AppError.notFound(`Plan '${planKey}' not found`)
    }
    if (plan.priceAmount <= 0) {
      throw AppError.badRequest(`Plan '${planKey}' is not purchasable`)
    }
    return plan
  }
}
