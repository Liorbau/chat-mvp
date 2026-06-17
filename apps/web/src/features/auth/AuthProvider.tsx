import { useEffect, useState, type ReactNode } from 'react'
import type { LoginRequest, SignupRequest } from '@chat/contract'
import { login as apiLogin, signup as apiSignup } from '../chat/api/apiClient'
import { AuthContext, type AuthContextValue } from './auth-context'
import { clearStoredAuth, loadAuth, saveAuth, subscribe, type StoredAuth } from './authStorage'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => loadAuth())
  useEffect(() => {
    return subscribe(setAuth)
  }, [])

  async function signIn(credentials: LoginRequest): Promise<void> {
    const result = await apiLogin(credentials)
    saveAuth(result)
  }

  async function signUp(input: SignupRequest): Promise<void> {
    const result = await apiSignup(input)
    saveAuth(result)
  }

  function signOut(): void {
    clearStoredAuth()
  }

  const value: AuthContextValue = {
    user: auth?.user ?? null,
    isAuthenticated: auth !== null,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
