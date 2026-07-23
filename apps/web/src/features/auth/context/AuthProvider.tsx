import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { LoginRequest, SignupRequest, UpdateProfileRequest, User } from '@chat/contract'
import { updateProfile as apiUpdateProfile } from '@/api'
import { getMe, login as apiLogin, signup as apiSignup } from '../apiActions/auth'
import { AuthContext, type AuthContextValue } from './auth.context'
import {
  clearStoredAuth,
  loadAuth,
  saveAuth,
  subscribe,
  updateUser,
  type StoredAuth,
} from '@/shared/auth/authStorage'

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

  async function updateProfile(input: UpdateProfileRequest): Promise<User> {
    const updated = await apiUpdateProfile(input)
    updateUser(updated)
    return updated
  }

  const refreshUser = useCallback(async (): Promise<User> => {
    const fresh = await getMe()
    updateUser(fresh)
    return fresh
  }, [])

  function signOut(): void {
    clearStoredAuth()
  }

  const value: AuthContextValue = {
    user: auth?.user ?? null,
    isAuthenticated: auth != null,
    signIn,
    signUp,
    updateProfile,
    refreshUser,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
