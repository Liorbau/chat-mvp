import { createContext, useContext } from 'react'
import type { SignupFormValue } from './SignupScreen.types'

export const SignupFormContext = createContext<SignupFormValue | null>(null)

export function useSignupContext(): SignupFormValue {
  const context = useContext(SignupFormContext)
  if (context === null) {
    throw new Error('useSignupContext must be used within a SignupScreenContainer')
  }

  return context
}
