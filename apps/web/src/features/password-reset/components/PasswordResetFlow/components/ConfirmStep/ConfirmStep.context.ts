import { createContext, useContext } from 'react'
import type { ConfirmResetContextValue } from './ConfirmStep.types'

export const ConfirmResetContext = createContext<ConfirmResetContextValue | null>(null)

export function useConfirmResetContext(): ConfirmResetContextValue {
  const context = useContext(ConfirmResetContext)
  if (context == null) {
    throw new Error('useConfirmResetContext must be used inside <ConfirmStepContainer>')
  }
  return context
}
