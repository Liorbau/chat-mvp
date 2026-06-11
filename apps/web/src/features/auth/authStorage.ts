import type { AuthResponse } from '@chat/contract'

const STORAGE_KEY = 'chat.auth'

export type StoredAuth = AuthResponse

type Listener = (auth: StoredAuth | null) => void

const listeners = new Set<Listener>()

function read(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === null ? null : (JSON.parse(raw) as StoredAuth)
  } catch {
    return null
  }
}

let cached: StoredAuth | null = read()

function emit(): void {
  for (const listener of listeners) {
    listener(cached)
  }
}

export function loadAuth(): StoredAuth | null {
  return cached
}

export function getToken(): string | null {
  return cached?.token ?? null
}

export function saveAuth(auth: StoredAuth): void {
  cached = auth
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  emit()
}

export function clearStoredAuth(): void {
  cached = null
  localStorage.removeItem(STORAGE_KEY)
  emit()
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
