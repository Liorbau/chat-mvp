import { useCallback, useEffect, useState } from 'react'
import type { User } from '@chat/contract'
import { getUsers } from '@/api'

type UserDirectory = {
  users: User[]
  getUserDisplayName: (userId: string) => string
  getUserAvatarUrl: (userId: string) => string | null
}

export function useUserDirectory(
  currentUser: User | null,
  isAuthenticated: boolean,
): UserDirectory {
  const [users, setUsers] = useState<User[]>([])

  const loadUsers = useCallback(() => {
    void getUsers()
      .then(setUsers)
      .catch(() => {})
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
    if (currentUser != null && userId === currentUser.id) {
      return currentUser.name
    }
    return users.find((directoryUser) => directoryUser.id === userId)?.name ?? userId
  }

  function getUserAvatarUrl(userId: string): string | null {
    if (currentUser != null && userId === currentUser.id) {
      return currentUser.avatarUrl
    }
    return users.find((directoryUser) => directoryUser.id === userId)?.avatarUrl ?? null
  }

  return { users, getUserDisplayName, getUserAvatarUrl }
}
