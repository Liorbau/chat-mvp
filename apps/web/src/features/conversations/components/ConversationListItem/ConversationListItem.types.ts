import type { DisplayConversation } from '@/features/conversations/types'

export type ConversationListItemProps = {
  conversation: DisplayConversation
  isSelected: boolean
  onSelect: (id: DisplayConversation['id']) => void
}
