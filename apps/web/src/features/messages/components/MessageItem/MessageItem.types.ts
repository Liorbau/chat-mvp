import type { OptimisticMessage } from '@/features/messages/hooks/optimisticMessages.types'

export type MessageItemProps = {
  message: OptimisticMessage
  currentUserId: string
  senderDisplayName: string
  senderAvatarUrl: string | null
}
