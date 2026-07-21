import { createContext, useContext } from 'react'
import type { RequestResetContextValue } from './RequestStep.types'

export const RequestResetContext = createContext<RequestResetContextValue | null>(null)

export function useRequestResetContext(): RequestResetContextValue {
  const context = useContext(RequestResetContext)
  if (context == null) {
    throw new Error('useRequestResetContext must be used inside <RequestStepContainer>')
  }
  return context
}
