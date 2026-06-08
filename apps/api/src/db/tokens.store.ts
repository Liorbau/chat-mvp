const tokens = new Map<string, string>()

export function getTokenUserId(token: string): string | undefined {
  return tokens.get(token)
}

export function setToken(token: string, userId: string): void {
  tokens.set(token, userId)
}

export function deleteToken(token: string): void {
  tokens.delete(token)
}

export function clearTokens(): void {
  tokens.clear()
}
