import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { PlanKey } from '@chat/contract'
import type { HydratedDocument } from 'mongoose'

export type PlanDocument = HydratedDocument<Plan>

@Schema()
export class Plan {
  @Prop({ type: String, required: true })
  _id!: PlanKey

  @Prop({ required: true })
  name!: string

  @Prop({ type: Number, required: true })
  priceAmount!: number

  @Prop({ required: true })
  currency!: string
}

export const PlanSchema = SchemaFactory.createForClass(Plan)
