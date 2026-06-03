import type { LoadStatus } from '../state/chatStatus'
import type { Message } from '../api/chatApi.types'

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
