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
import { PasswordResetFlowContainer } from './features/password-reset/components/PasswordResetFlow/PasswordResetFlowContainer'

type AuthMode = 'login' | 'signup' | 'reset'

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

  if (isAuthenticated && user != null) {
    return <ChatLayoutContainer currentUserId={user.id} onLogout={signOut} />
  }

  if (authMode === 'signup') {
    return (
      <SignupScreenContainer
        onSwitchToLogin={() => {
          setAuthMode('login')
        }}
      />
    )
  }

  if (authMode === 'reset') {
    return (
      <PasswordResetFlowContainer
        onExit={() => {
          setAuthMode('login')
        }}
      />
    )
  }

  return (
    <LoginScreenContainer
      onSwitchToSignup={() => {
        setAuthMode('signup')
      }}
      onForgotPassword={() => {
        setAuthMode('reset')
      }}
    />
  )
}
