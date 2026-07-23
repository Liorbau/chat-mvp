import type { Message } from '@chat/contract'

export type AssistantPanelProps = {
  currentUserId: string
}

export type AssistantMessageProps = {
  message: Message
  currentUserId: string
}
