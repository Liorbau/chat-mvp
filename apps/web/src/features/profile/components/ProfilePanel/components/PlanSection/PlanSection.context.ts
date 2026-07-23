import { createContext, useContext } from 'react'
import type { PlanContextValue } from './PlanSection.types'

export const PlanContext = createContext<PlanContextValue | null>(null)

export function usePlanContext(): PlanContextValue {
  const context = useContext(PlanContext)
  if (context == null) {
    throw new Error('usePlanContext must be used inside <PlanSectionContainer>')
  }
  return context
}
