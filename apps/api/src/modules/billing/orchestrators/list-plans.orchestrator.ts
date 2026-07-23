import { Injectable } from '@nestjs/common'
import type { ListPlansResponse } from '@chat/contract'
import { PlansService } from '../plans/plans.service'

@Injectable()
export class ListPlansOrchestrator {
  constructor(private readonly plansService: PlansService) {}

  async execute(): Promise<ListPlansResponse> {
    const plans = await this.plansService.listPlans()
    return { plans }
  }
}
