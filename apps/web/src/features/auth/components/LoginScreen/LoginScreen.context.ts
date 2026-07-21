import { createContext, useContext } from 'react'
import type { LoginFormValue } from './LoginScreen.types'

export const LoginFormContext = createContext<LoginFormValue | null>(null)

export function useLoginContext(): LoginFormValue {
  const context = useContext(LoginFormContext)
  if (context == null) {
    throw new Error('useLoginContext must be used within a LoginScreenContainer')
  }

  return context
}
