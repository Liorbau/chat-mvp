import { ConversationList } from '@/features/conversations/components/ConversationList/ConversationList'
import { ConversationListSkeleton } from '@/features/conversations/components/ConversationListSkeleton/ConversationListSkeleton'
import type { ConversationListContainerProps } from './ConversationListContainer.types'

export function ConversationListContainer({
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
