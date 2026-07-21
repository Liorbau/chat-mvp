const TOKEN_PARAM = 'emailChangeToken'

export function readEmailChangeToken(): string | null {
  return new URLSearchParams(window.location.search).get(TOKEN_PARAM)
}

export function clearEmailChangeTokenFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete(TOKEN_PARAM)
  window.history.replaceState(null, '', url.toString())
}
