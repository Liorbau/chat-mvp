import { LoginFormContext } from './LoginScreen.context'
import { LoginScreen } from './LoginScreen'
import type { LoginScreenProps } from './LoginScreen.types'
import { useLoginForm } from './hooks/useLoginForm'

export function LoginScreenContainer({ onSwitchToSignup, onForgotPassword }: LoginScreenProps) {
  const value = useLoginForm()

  return (
    <LoginFormContext.Provider value={value}>
      <LoginScreen onSwitchToSignup={onSwitchToSignup} onForgotPassword={onForgotPassword} />
    </LoginFormContext.Provider>
  )
}
