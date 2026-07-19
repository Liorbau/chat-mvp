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

export function deriveName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

// Pure request → DAO update (re-derives name); email uniqueness is guarded in the service.
export function buildUserUpdate(current: User, changes: UpdateProfileRequest): UserUpdate {
  const update: UserUpdate = {}

  if (changes.firstName !== undefined || changes.lastName !== undefined) {
    const firstName = changes.firstName ?? current.firstName
    const lastName = changes.lastName ?? current.lastName
    update.firstName = firstName
    update.lastName = lastName
    update.name = deriveName(firstName, lastName)
  }

  if (changes.email !== undefined && changes.email !== current.email) {
    update.email = changes.email
  }

  return update
}
