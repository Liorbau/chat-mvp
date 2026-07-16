import type { ConversationType } from '@chat/contract'

export type CreateConversationInput = {
  type?: ConversationType
  title?: string
  participantIds?: string[]
}
