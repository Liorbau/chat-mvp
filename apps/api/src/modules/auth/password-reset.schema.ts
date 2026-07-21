import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

export type PasswordResetDocument = HydratedDocument<PasswordReset>

@Schema({ collection: 'password_resets', timestamps: { createdAt: true, updatedAt: false } })
export class PasswordReset {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ required: true, unique: true })
  userId!: string

  @Prop({ required: true })
  codeHash!: string

  @Prop({ type: Date, required: true })
  expiresAt!: Date

  createdAt!: Date
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset)

PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
