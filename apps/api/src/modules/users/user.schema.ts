import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

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

  // Object-storage key of the uploaded avatar (e.g. `avatars/<userId>/<uuid>`), or
  // null when unset. The public CDN URL is derived from this at read time.
  @Prop({ type: String, default: null })
  avatarVersion!: string | null
}

export const UserSchema = SchemaFactory.createForClass(User)
