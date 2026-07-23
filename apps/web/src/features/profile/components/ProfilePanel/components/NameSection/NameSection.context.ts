import { createContext, useContext } from 'react'
import type { NameSectionContextValue } from './NameSection.types'

export const NameSectionContext = createContext<NameSectionContextValue | null>(null)

export function useNameSectionContext(): NameSectionContextValue {
  const context = useContext(NameSectionContext)
  if (context == null) {
    throw new Error('useNameSectionContext must be used inside <NameSectionContainer>')
  }
  return context
}
