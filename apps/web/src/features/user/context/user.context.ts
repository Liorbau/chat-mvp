import { createContext, useContext } from 'react'
import type { User } from '@chat/contract'

export type UserContextValue = {
  users: User[]
  getUserDisplayName: (userId: string) => string
}

export const UserContext = createContext<UserContextValue | null>(null)

export function useUsers(): UserContextValue {
  const context = useContext(UserContext)
  if (context === null) {
    throw new Error('useUsers must be used within a UserProvider')
  }

  return context
}
