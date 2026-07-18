import type { DisplayConversation } from '@/features/conversations/types'
import type { LoadStatus } from '@/shared/state/chatStatus'

export type ConversationListContainerProps = {
  status: LoadStatus
  conversations: DisplayConversation[]
  error: string | null
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
}
