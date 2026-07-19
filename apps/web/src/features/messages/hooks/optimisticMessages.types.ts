import type { Message } from '@chat/contract'
import type { LoadStatus } from '@/shared/state/chatStatus'

export type MessageDeliveryStatus = 'pending' | 'sent'

export type OptimisticMessage = Message & {
  deliveryStatus: MessageDeliveryStatus
}

export type UseOptimisticMessagesResult = {
  status: LoadStatus
  messages: OptimisticMessage[]
  error: string | null
  sendMessage: (content: string) => Promise<void>
  refetch: () => void
}
