import { createContext, useContext } from 'react'
import type { AvatarContextValue } from './AvatarSection.types'

export const AvatarContext = createContext<AvatarContextValue | null>(null)

export function useAvatarContext(): AvatarContextValue {
  const context = useContext(AvatarContext)
  if (context === null) {
    throw new Error('useAvatarContext must be used inside <AvatarSectionContainer>')
  }
  return context
}
