import type { LoadStatus } from '@/shared/state/chatStatus'
import type { MessageListItem } from '@/features/messages/components/MessageList/MessageList.types'

export type MessagePanelProps = {
  selectedConversationId: string | null
  status: LoadStatus
  items: MessageListItem[]
  currentUserId: string
  error: string | null
  onSend: (content: string) => Promise<void>
  onRetry: () => void
}
