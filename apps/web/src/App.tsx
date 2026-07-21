import { useState } from 'react'
import { ChatLayoutContainer } from './features/app/components/ChatLayout/ChatLayoutContainer'
import { LoginScreenContainer } from './features/auth/components/LoginScreen/LoginScreenContainer'
import { SignupScreenContainer } from './features/auth/components/SignupScreen/SignupScreenContainer'
import { useAuth } from './features/auth/context/auth.context'
import { ConfirmEmailScreenContainer } from './features/email-change/components/ConfirmEmailScreen/ConfirmEmailScreenContainer'
import {
  clearEmailChangeTokenFromUrl,
  readEmailChangeToken,
} from './features/email-change/lib/emailChangeToken'

type AuthMode = 'login' | 'signup'

export function App() {
  const { user, isAuthenticated, signOut } = useAuth()
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [emailChangeToken, setEmailChangeToken] = useState<string | null>(() =>
    readEmailChangeToken(),
  )

  // A confirmation link is being opened: run the confirm flow regardless of
  // whether the visitor is logged in (the token is the credential).
  if (emailChangeToken != null) {
    return (
      <ConfirmEmailScreenContainer
        token={emailChangeToken}
        onDone={() => {
          clearEmailChangeTokenFromUrl()
          setEmailChangeToken(null)
        }}
      />
    )
  }

  return !isAuthenticated || user == null ? (
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
