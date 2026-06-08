import { useState } from 'react'
import { logout } from './features/chat/api/apiClient'
import type { User } from './features/chat/api/chatApi.types'
import ChatLayout from './features/chat/components/ChatLayout'
import LoginScreen from './features/chat/components/LoginScreen'

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [knownUsersById, setKnownUsersById] = useState<Record<string, User>>({})

  function handleLogin(user: User): void {
    setCurrentUser(user)
    setKnownUsersById((previousUsersById) => {
      return { ...previousUsersById, [user.id]: user }
    })
  }

  function getUserDisplayName(userId: string): string {
    const matchedUser = knownUsersById[userId]
    return matchedUser?.name ?? `Unknown user (${userId})`
  }

  function handleLogout() {
    setCurrentUser(null)
    void logout()
  }

  if (currentUser === null) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <ChatLayout
      currentUserId={currentUser.id}
      getUserDisplayName={getUserDisplayName}
      onLogout={handleLogout}
    />
  )
}

export default App
