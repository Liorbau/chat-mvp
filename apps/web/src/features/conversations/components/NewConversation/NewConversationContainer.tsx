import { NewConversationContext } from './NewConversation.context'
import { NewConversation } from './NewConversation'
import type { NewConversationProps } from './NewConversation.types'
import { useNewConversation } from './useNewConversation'

export function NewConversationContainer({ currentUserId, onCreated }: NewConversationProps) {
  const value = useNewConversation(currentUserId, onCreated)

  return (
    <NewConversationContext.Provider value={value}>
      <NewConversation />
    </NewConversationContext.Provider>
  )
}
