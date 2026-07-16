import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/context/auth.context'
import { useUserDirectory } from '@/features/user/hooks/useUserDirectory'
import { UserContext, type UserContextValue } from './user.context'

type UserProviderProps = {
  children: ReactNode
}

// Owns the user directory (names for the whole app) so consumers read it from
// context instead of receiving it drilled through the layout.
export function UserProvider({ children }: UserProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const value: UserContextValue = useUserDirectory(user, isAuthenticated)

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
