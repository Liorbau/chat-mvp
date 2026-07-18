import { createContext, useContext } from 'react'
import type { ComposerValue } from './composer.types'

export const ComposerContext = createContext<ComposerValue | null>(null)

export function useComposerContext(): ComposerValue {
  const context = useContext(ComposerContext)
  if (context === null) {
    throw new Error('useComposerContext must be used within an assistant or tutor panel container')
  }

  return context
}
