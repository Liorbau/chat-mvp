import type { Conversation } from '@chat/contract'

export type ConversationListItemProps = {
  conversation: Conversation
  isSelected: boolean
  onSelect: (id: Conversation['id']) => void
}
