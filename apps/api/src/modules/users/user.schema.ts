import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

// `_id` is an app-level uuid string (seed users use pinned uuids, signups
// generate uuids), so a single id format is used everywhere and existing
// conversation participantIds / message senderId references stay valid.
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string

  @Prop({ required: true })
  name!: string

  @Prop({ required: true })
  passwordHash!: string
}

export const UserSchema = SchemaFactory.createForClass(User)
