import type { Message } from '@chat/contract'

export type AssistantPanelProps = {
  currentUserId: string
}

export type AssistantMessageProps = {
  message: Message
  currentUserId: string
}

export type AssistantStreamingBubbleProps = {
  streamingText: string | null
  toolLabel: string | null
}

export type AssistantComposerProps = {
  input: string
  isStreaming: boolean
  canSend: boolean
  onInputChange: (value: string) => void
  onSubmit: () => void
}
