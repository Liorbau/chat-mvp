import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { PlanKey, SubscriptionStatus } from '@chat/contract'
import type { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ _id: false })
export class Avatar {
  @Prop({ required: true })
  srcUrl!: string

  @Prop({ type: String, default: null })
  storageKey!: string | null
}

const AvatarSchema = SchemaFactory.createForClass(Avatar)

@Schema({ _id: false })
export class Subscription {
  @Prop({ type: String, required: true, default: 'free' })
  planKey!: PlanKey

  @Prop({ type: String, required: true, default: 'none' })
  status!: SubscriptionStatus
}

const SubscriptionSchema = SchemaFactory.createForClass(Subscription)

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string

  @Prop({ required: true })
  name!: string

  @Prop({ required: true })
  firstName!: string

  @Prop({ required: true })
  lastName!: string

  @Prop({ required: true })
  passwordHash!: string

  @Prop({ type: AvatarSchema, default: null })
  avatar!: Avatar | null

  @Prop({ type: [String], default: [] })
  previousEmails!: string[]

  @Prop({ type: Number, default: 0 })
  tokenVersion!: number

  @Prop({
    type: SubscriptionSchema,
    default: (): Subscription => ({ planKey: 'free', status: 'none' }),
  })
  subscription!: Subscription
}

export const UserSchema = SchemaFactory.createForClass(User)
