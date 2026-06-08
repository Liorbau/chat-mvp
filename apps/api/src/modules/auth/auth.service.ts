import type { User } from '@chat/contract'
import { AppError } from '../../errors/AppError'
import { issue, revoke } from '../../dbServices/tokens.dbService'
import { findById } from '../../dbServices/users.dbService'

export type LoginResult = {
  token: string
  user: User
}

export function loginUser(userId: string): LoginResult {
  const user = findById(userId)
  if (user === undefined) {
    throw AppError.unauthorized('Invalid credentials')
  }

  const token = issue(userId)
  return { token, user }
}

export function logoutUser(token: string): void {
  revoke(token)
}
