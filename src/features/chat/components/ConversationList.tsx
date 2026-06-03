import type { Conversation } from '../api/chatApi.types'
import ConversationListItem from './ConversationListItem'

type ConversationListProps = {
  conversations: Conversation[]
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
}

const CONVERSATION_LIST_STYLE = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 0,
}

function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <ul style={CONVERSATION_LIST_STYLE}>
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

export default ConversationList
