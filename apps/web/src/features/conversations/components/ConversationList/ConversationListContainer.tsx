import { ConversationList } from './ConversationList'
import { ConversationListSkeleton } from '@/features/conversations/components/ConversationListSkeleton/ConversationListSkeleton'
import type { ConversationListContainerProps } from './ConversationListContainer.types'

export function ConversationListContainer({
  status,
  conversations,
  error,
  selectedConversationId,
  onSelectConversation,
}: ConversationListContainerProps) {
  return status === 'idle' || status === 'loading' ? (
    <ConversationListSkeleton />
  ) : status === 'error' ? (
    <p>{error ?? 'Failed to load conversations'}</p>
  ) : status === 'empty' ? (
    <p>No conversations yet</p>
  ) : (
    <ConversationList
      conversations={conversations}
      selectedConversationId={selectedConversationId}
      onSelectConversation={onSelectConversation}
    />
  )
}
