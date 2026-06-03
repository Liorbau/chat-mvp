let currentSessionUserId: string | null = null

export function setSessionUserId(userId: string | null): void {
  currentSessionUserId = userId
}

export function getSessionUserId(): string | null {
  return currentSessionUserId
}
