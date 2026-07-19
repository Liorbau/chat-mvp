import { useState } from 'react'
import { ChatLayoutContainer } from './features/app/components/ChatLayout/ChatLayoutContainer'
import { LoginScreenContainer } from './features/auth/components/LoginScreen/LoginScreenContainer'
import { SignupScreenContainer } from './features/auth/components/SignupScreen/SignupScreenContainer'
import { useAuth } from './features/auth/context/auth.context'

type AuthMode = 'login' | 'signup'

export function App() {
  const { user, isAuthenticated, signOut } = useAuth()
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  return !isAuthenticated || user === null ? (
    authMode === 'login' ? (
      <LoginScreenContainer
        onSwitchToSignup={() => {
          setAuthMode('signup')
        }}
      />
    ) : (
      <SignupScreenContainer
        onSwitchToLogin={() => {
          setAuthMode('login')
        }}
      />
    )
  ) : (
    <ChatLayoutContainer currentUserId={user.id} onLogout={signOut} />
  )
}
