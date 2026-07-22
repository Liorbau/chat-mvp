import { createContext, useContext } from 'react'
import type { PasswordResetFlowContextValue } from './PasswordResetFlow.types'

export const PasswordResetFlowContext = createContext<PasswordResetFlowContextValue | null>(null)

export function usePasswordResetFlowContext(): PasswordResetFlowContextValue {
  const context = useContext(PasswordResetFlowContext)
  if (context == null) {
    throw new Error('usePasswordResetFlowContext must be used inside <PasswordResetFlowContainer>')
  }
  return context
}
