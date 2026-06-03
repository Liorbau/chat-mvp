import type { Message } from '../api/chatApi.types'
import type { LoadStatus } from '../state/chatStatus'
import type { OptimisticMessage } from './optimisticMessages.types'

function sortByCreatedAt(firstMessage: Message, secondMessage: Message) {
  return firstMessage.createdAt.localeCompare(secondMessage.createdAt)
}

export function toSentOptimisticMessages(messages: Message[]): OptimisticMessage[] {
  return messages.map((message) => {
    return {
      ...message,
      deliveryStatus: 'sent',
    }
  })
}

export function toPendingOptimisticMessages(messages: Message[]): OptimisticMessage[] {
  return messages.map((message) => {
    return {
      ...message,
      deliveryStatus: 'pending',
    }
  })
}

export function mergeOptimisticMessages(
  sentMessages: OptimisticMessage[],
  pendingMessages: OptimisticMessage[],
): OptimisticMessage[] {
  return [...sentMessages, ...pendingMessages].sort(sortByCreatedAt)
}

export function resolveOptimisticStatus(
  conversationId: string | null,
  baseStatus: LoadStatus,
  mergedMessages: OptimisticMessage[],
): LoadStatus {
  if (conversationId === null) {
    return 'idle'
  }

  if (mergedMessages.length > 0 && (baseStatus === 'loading' || baseStatus === 'empty')) {
    return 'success'
  }

  return baseStatus
}
