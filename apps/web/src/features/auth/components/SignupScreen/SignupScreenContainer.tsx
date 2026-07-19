import { SignupFormContext } from './SignupScreen.context'
import { SignupScreen } from './SignupScreen'
import type { SignupScreenProps } from './SignupScreen.types'
import { useSignupForm } from './useSignupForm'

export function SignupScreenContainer({ onSwitchToLogin }: SignupScreenProps) {
  const value = useSignupForm()

  return (
    <SignupFormContext.Provider value={value}>
      <SignupScreen onSwitchToLogin={onSwitchToLogin} />
    </SignupFormContext.Provider>
  )
}
