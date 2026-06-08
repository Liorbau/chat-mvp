import type { User } from '@chat/contract'
import { getUser } from '../db/users.store'

export function findById(userId: string): User | undefined {
  return getUser(userId)
}
