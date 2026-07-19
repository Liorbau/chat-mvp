import { useCallback, useEffect, useState } from 'react'
import type { User } from '@chat/contract'
import { getUsers } from '@/api'

type UserDirectory = {
  users: User[]
  getUserDisplayName: (userId: string) => string
}

// Loads the user directory (once authenticated, refreshed on focus) and resolves
// display names — the current user from the live auth value, others from the list.
export function useUserDirectory(
  currentUser: User | null,
  isAuthenticated: boolean,
): UserDirectory {
  const [users, setUsers] = useState<User[]>([])

  const loadUsers = useCallback(() => {
    void getUsers()
      .then(setUsers)
      .catch(() => {
        // Non-fatal: names fall back to ids until the next successful load.
      })
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    loadUsers()
    window.addEventListener('focus', loadUsers)
    return () => {
      window.removeEventListener('focus', loadUsers)
    }
  }, [isAuthenticated, loadUsers])

  function getUserDisplayName(userId: string): string {
    if (currentUser !== null && userId === currentUser.id) {
      return currentUser.name
    }
    return users.find((directoryUser) => directoryUser.id === userId)?.name ?? userId
  }

  return { users, getUserDisplayName }
}
