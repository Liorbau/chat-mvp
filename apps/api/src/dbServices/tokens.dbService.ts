import { randomUUID } from 'node:crypto'
import { deleteToken, getTokenUserId, setToken } from '../db/tokens.store'

export function issue(userId: string): string {
  const token = randomUUID()
  setToken(token, userId)
  return token
}

export function findUserId(token: string): string | undefined {
  return getTokenUserId(token)
}

export function revoke(token: string): void {
  deleteToken(token)
}
