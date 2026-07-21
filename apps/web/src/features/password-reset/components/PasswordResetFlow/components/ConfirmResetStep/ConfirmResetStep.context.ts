import { createContext, useContext } from 'react'
import type { ConfirmResetContextValue } from './ConfirmResetStep.types'

export const ConfirmResetContext = createContext<ConfirmResetContextValue | null>(null)

export function useConfirmResetContext(): ConfirmResetContextValue {
  const context = useContext(ConfirmResetContext)
  if (context == null) {
    throw new Error('useConfirmResetContext must be used inside <ConfirmResetStepContainer>')
  }
  return context
}
