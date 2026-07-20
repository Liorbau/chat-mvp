import { ConversationListItem } from '@/features/conversations/components/ConversationListItem/ConversationListItem'
import { CONVERSATION_LIST_STYLE } from './ConversationList.styles'
import type { ConversationListProps } from './ConversationList.types'

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <ul className={CONVERSATION_LIST_STYLE}>
      {conversations.map((conversation) => {
        const isSelected = selectedConversationId === conversation.id

        return (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            isSelected={isSelected}
            onSelect={onSelectConversation}
          />
        )
      })}
    </ul>
  )
}
