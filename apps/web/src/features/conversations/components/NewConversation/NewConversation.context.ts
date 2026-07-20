import { createContext, useContext } from 'react'
import type { NewConversationValue } from './NewConversation.types'

export const NewConversationContext = createContext<NewConversationValue | null>(null)

export function useNewConversationContext(): NewConversationValue {
  const context = useContext(NewConversationContext)
  if (context == null) {
    throw new Error('useNewConversationContext must be used within a NewConversationContainer')
  }

  return context
}
