import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './features/auth/auth-context'
import { getUsers } from './features/chat/api/apiClient'
import type { User } from './features/chat/api/chatApi.types'
import ChatLayout from './features/chat/components/ChatLayout'
import LoginScreen from './features/chat/components/LoginScreen'
import SignupScreen from './features/chat/components/SignupScreen'

type AuthMode = 'login' | 'signup'

function App() {
  const { user, isAuthenticated, signOut } = useAuth()
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [users, setUsers] = useState<User[]>([])

  const loadUsers = useCallback(() => {
    void getUsers()
      .then(setUsers)
      .catch(() => {
        // Non-fatal: names fall back to ids until the next successful load.
      })
  }, [])

  // Load the user directory once authenticated, and refresh it when the tab
  // regains focus so people who signed up later resolve to real names.
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
    return users.find((directoryUser) => directoryUser.id === userId)?.name ?? userId
  }

  if (!isAuthenticated || user === null) {
    return authMode === 'login' ? (
      <LoginScreen
        onSwitchToSignup={() => {
          setAuthMode('signup')
        }}
      />
    ) : (
      <SignupScreen
        onSwitchToLogin={() => {
          setAuthMode('login')
        }}
      />
    )
  }

  return (
    <ChatLayout
      currentUserId={user.id}
      users={users}
      getUserDisplayName={getUserDisplayName}
      onLogout={signOut}
    />
  )
}

export default App
