import type { OptimisticMessage } from '@/features/messages/hooks/optimisticMessages.types'

export type MessageListItem = {
  message: OptimisticMessage
  senderDisplayName: string
  senderAvatarUrl: string | null
}

export type MessageListProps = {
  items: MessageListItem[]
  currentUserId: string
}
