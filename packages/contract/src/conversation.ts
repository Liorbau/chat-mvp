export type ConversationType = 'user' | 'assistant' | 'tutor'

export const ASSISTANT_SENDER_ID = 'assistant'

export type Conversation = {
  id: string
  type: ConversationType
  title?: string
  participantIds: string[]
  lastMessagePreview: string
  updatedAt: string
}
