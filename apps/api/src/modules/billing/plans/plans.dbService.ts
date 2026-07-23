import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Plan, PlanKey } from '@chat/contract'
import type { Model } from 'mongoose'
import { toPlan } from './plan.mapper'
import { Plan as PlanModel, type PlanDocument } from './plan.schema'

@Injectable()
export class PlansDbService {
  constructor(
    @InjectModel(PlanModel.name)
    private readonly planModel: Model<PlanDocument>,
  ) {}

  async listAll(): Promise<Plan[]> {
    const docs = await this.planModel.find().exec()
    return docs.map(toPlan)
  }

  async findByKey(key: PlanKey): Promise<Plan | undefined> {
    const doc = await this.planModel.findById(key).exec()
    return doc == null ? undefined : toPlan(doc)
  }

  async ensureSeeded(plans: Plan[]): Promise<number> {
    if (plans.length === 0) {
      return 0
    }
    const result = await this.planModel.bulkWrite(
      plans.map((plan) => ({
        updateOne: {
          filter: { _id: plan.key },
          update: {
            $setOnInsert: {
              name: plan.name,
              priceAmount: plan.priceAmount,
              currency: plan.currency,
            },
          },
          upsert: true,
        },
      })),
    )
    return result.upsertedCount
  }
}
