import type { User } from '@chat/contract'
import type { UserDocument } from './user.schema'

export type StoredAvatar = {
  srcUrl: string
  storageKey: string | null
}

export type StoredUser = {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  passwordHash: string
  avatar: StoredAvatar | null
}

export type StoredUserDraft = Omit<StoredUser, 'id'>

export type UserUpdate = Partial<Pick<StoredUser, 'firstName' | 'lastName' | 'name' | 'email'>>

export function toStoredUser(doc: UserDocument): StoredUser {
  return {
    id: doc._id,
    name: doc.name,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    passwordHash: doc.passwordHash,
    avatar:
      doc.avatar === null
        ? null
        : { srcUrl: doc.avatar.srcUrl, storageKey: doc.avatar.storageKey ?? null },
  }
}

export function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatarUrl: user.avatar?.srcUrl ?? null,
  }
}
