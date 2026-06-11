import type { User } from '@chat/contract'

// Server-only persisted shape: the public `User` plus the bcrypt password hash.
export type StoredUser = User & { passwordHash: string }

const users = new Map<string, StoredUser>()

export function getUser(userId: string): StoredUser | undefined {
  return users.get(userId)
}

export function getUserByEmail(email: string): StoredUser | undefined {
  const normalizedEmail = email.trim().toLowerCase()
  for (const user of users.values()) {
    if (user.email.toLowerCase() === normalizedEmail) {
      return user
    }
  }

  return undefined
}

export function getAllUsers(): StoredUser[] {
  return [...users.values()]
}

export function setUser(user: StoredUser): void {
  users.set(user.id, user)
}

export function clearUsers(): void {
  users.clear()
}
