import type { User } from '@chat/contract'

const users = new Map<string, User>()

export function getUser(userId: string): User | undefined {
  return users.get(userId)
}

export function setUser(user: User): void {
  users.set(user.id, user)
}

export function clearUsers(): void {
  users.clear()
}
