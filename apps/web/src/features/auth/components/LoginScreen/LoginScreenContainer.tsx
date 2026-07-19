import { LoginFormContext } from './LoginScreen.context'
import { LoginScreen } from './LoginScreen'
import type { LoginScreenProps } from './LoginScreen.types'
import { useLoginForm } from './useLoginForm'

export function LoginScreenContainer({ onSwitchToSignup }: LoginScreenProps) {
  const value = useLoginForm()

  return (
    <LoginFormContext.Provider value={value}>
      <LoginScreen onSwitchToSignup={onSwitchToSignup} />
    </LoginFormContext.Provider>
  )
}
