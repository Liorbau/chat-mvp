import { createContext, useContext } from 'react'
import type { LoginRequest, SignupRequest, User } from '@chat/contract'

export type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  signIn: (credentials: LoginRequest) => Promise<void>
  signUp: (input: SignupRequest) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
