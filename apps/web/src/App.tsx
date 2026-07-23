import { useState, type ReactNode } from 'react'
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
import { readUpgradeReturn } from './features/profile/utils/upgradeReturn'

type AuthMode = 'login' | 'signup' | 'reset'

export function App() {
  const { user, isAuthenticated, signOut } = useAuth()
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [emailChangeToken, setEmailChangeToken] = useState<string | null>(() =>
    readEmailChangeToken(),
  )
  const [upgradeReturn] = useState(() => readUpgradeReturn())

  let screen: ReactNode
  // A confirmation link is being opened: run the confirm flow regardless of
  // whether the visitor is logged in (the token is the credential).
  if (emailChangeToken != null) {
    screen = (
      <ConfirmEmailScreenContainer
        token={emailChangeToken}
        onDone={() => {
          clearEmailChangeTokenFromUrl()
          setEmailChangeToken(null)
        }}
      />
    )
  } else if (isAuthenticated && user != null) {
    screen = (
      <ChatLayoutContainer
        currentUserId={user.id}
        onLogout={signOut}
        initialMode={upgradeReturn == null ? 'chats' : 'profile'}
      />
    )
  } else if (authMode === 'signup') {
    screen = (
      <SignupScreenContainer
        onSwitchToLogin={() => {
          setAuthMode('login')
        }}
      />
    )
  } else if (authMode === 'reset') {
    screen = (
      <PasswordResetFlowContainer
        onExit={() => {
          setAuthMode('login')
        }}
      />
    )
  } else {
    screen = (
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

  return screen
}
