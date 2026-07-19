import { createContext, useContext } from 'react'
import { useUserDirectory } from '@/features/user/hooks/useUserDirectory'

// Single source of truth for the shape: the provider fills this from the hook.
export type UserContextValue = ReturnType<typeof useUserDirectory>

export const UserContext = createContext<UserContextValue | null>(null)

export function useUsers(): UserContextValue {
  const context = useContext(UserContext)
  if (context === null) {
    throw new Error('useUsers must be used within a UserProvider')
  }

  return context
}
