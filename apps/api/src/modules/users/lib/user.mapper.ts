import type { UpdateProfileRequest, User } from '@chat/contract'
import type { UserDocument } from '../user.schema'

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
  previousEmails: string[]
  tokenVersion: number
}

export type StoredUserDraft = Omit<StoredUser, 'id' | 'previousEmails' | 'tokenVersion'>

export type UserUpdate = Partial<Pick<StoredUser, 'firstName' | 'lastName' | 'name'>>

export function toStoredUser(doc: UserDocument): StoredUser {
  return {
    id: doc._id,
    name: doc.name,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    passwordHash: doc.passwordHash,
    avatar:
      doc.avatar == null
        ? null
        : { srcUrl: doc.avatar.srcUrl, storageKey: doc.avatar.storageKey ?? null },
    previousEmails: doc.previousEmails ?? [],
    tokenVersion: doc.tokenVersion ?? 0,
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
    previousEmails: user.previousEmails,
  }
}

export function deriveName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

export function buildUserUpdate(current: User, changes: UpdateProfileRequest): UserUpdate {
  const update: UserUpdate = {}

  if (changes.firstName !== undefined || changes.lastName !== undefined) {
    const firstName = changes.firstName ?? current.firstName
    const lastName = changes.lastName ?? current.lastName
    update.firstName = firstName
    update.lastName = lastName
    update.name = deriveName(firstName, lastName)
  }

  return update
}
