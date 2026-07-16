import type { Conversation } from '@chat/contract'
import type { LoadStatus } from '@/shared/state/chatStatus'

export type ConversationListContainerProps = {
  status: LoadStatus
  conversations: Conversation[]
  error: string | null
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
}
