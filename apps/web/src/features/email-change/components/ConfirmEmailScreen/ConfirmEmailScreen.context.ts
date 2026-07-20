import { createContext, useContext } from 'react'
import type { ConfirmEmailContextValue } from './ConfirmEmailScreen.types'

export const ConfirmEmailContext = createContext<ConfirmEmailContextValue | null>(null)

export function useConfirmEmailContext(): ConfirmEmailContextValue {
  const context = useContext(ConfirmEmailContext)
  if (context == null) {
    throw new Error('useConfirmEmailContext must be used inside <ConfirmEmailScreenContainer>')
  }
  return context
}
