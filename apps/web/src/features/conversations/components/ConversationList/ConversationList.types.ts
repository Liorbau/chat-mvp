import type { DisplayConversation } from '@/features/conversations/types'

export type ConversationListProps = {
  conversations: DisplayConversation[]
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
}
