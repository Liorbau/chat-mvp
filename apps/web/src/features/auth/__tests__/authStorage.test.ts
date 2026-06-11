import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthResponse } from '@chat/contract'
import { clearStoredAuth, getToken, loadAuth, saveAuth, subscribe } from '../authStorage'

const session: AuthResponse = {
  token: 'tok-123',
  user: { id: 'user-1', name: 'Alex', email: 'alex@example.com' },
}

beforeEach(() => {
  clearStoredAuth()
  localStorage.clear()
})

describe('authStorage', () => {
  it('persists the session to localStorage and exposes the token', () => {
    saveAuth(session)

    expect(getToken()).toBe('tok-123')
    expect(loadAuth()).toEqual(session)
    expect(localStorage.getItem('chat.auth')).toBe(JSON.stringify(session))
  })

  it('clears the session from memory and storage', () => {
    saveAuth(session)
    clearStoredAuth()

    expect(getToken()).toBeNull()
    expect(loadAuth()).toBeNull()
    expect(localStorage.getItem('chat.auth')).toBeNull()
  })

  it('notifies subscribers when auth is saved and cleared', () => {
    const listener = vi.fn()
    const unsubscribe = subscribe(listener)

    saveAuth(session)
    clearStoredAuth()

    expect(listener).toHaveBeenNthCalledWith(1, session)
    expect(listener).toHaveBeenNthCalledWith(2, null)

    unsubscribe()
    saveAuth(session)
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
