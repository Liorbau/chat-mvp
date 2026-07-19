import type { OptimisticMessage } from '@/features/messages/hooks/optimisticMessages.types'

export type MessageListProps = {
  messages: OptimisticMessage[]
  currentUserId: string
  getDisplayName: (userId: string) => string
}
