import type { RefObject } from 'react'
import type { Message } from '@chat/contract'

export type AssistantPanelProps = {
  currentUserId: string
}

export type AssistantPanelViewProps = {
  messages: Message[]
  streamingText: string | null
  toolLabel: string | null
  isStreaming: boolean
  error: string | null
  input: string
  canSend: boolean
  currentUserId: string
  endRef: RefObject<HTMLDivElement | null>
  onInputChange: (value: string) => void
  onSubmit: () => void
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
