import { useState } from 'react'
import { logout } from './features/chat/api/apiClient'
import type { User } from './features/chat/api/chatApi.types'
import ChatLayout from './features/chat/components/ChatLayout'
import LoginScreen from './features/chat/components/LoginScreen'

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  function handleLogout() {
    setCurrentUser(null)
    void logout()
  }

  if (currentUser === null) {
    return <LoginScreen onLogin={setCurrentUser} />
  }

  return <ChatLayout currentUserId={currentUser.id} onLogout={handleLogout} />
}

export default App
