import type { Conversation } from '../api/chatApi.types'
import type { LoadStatus } from '../state/chatStatus'
import ConversationList from './ConversationList'
import ConversationListSkeleton from './ConversationListSkeleton'

type ConversationListContainerProps = {
  status: LoadStatus
  conversations: Conversation[]
  error: string | null
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
}

function ConversationListContainer({
  status,
  conversations,
  error,
  selectedConversationId,
  onSelectConversation,
}: ConversationListContainerProps) {
  if (status === 'idle' || status === 'loading') {
    return <ConversationListSkeleton />
  }

  if (status === 'error') {
    return <p>{error ?? 'Failed to load conversations'}</p>
  }

  if (status === 'empty') {
    return <p>No conversations yet</p>
  }

  return (
    <ConversationList
      conversations={conversations}
      selectedConversationId={selectedConversationId}
      onSelectConversation={onSelectConversation}
    />
  )
}

export default ConversationListContainer
