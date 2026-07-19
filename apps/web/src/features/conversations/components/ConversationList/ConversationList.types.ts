import type { Conversation } from '@chat/contract'

export type ConversationListProps = {
  conversations: Conversation[]
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
}
