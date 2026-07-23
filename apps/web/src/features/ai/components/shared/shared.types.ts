import type { ComponentType } from 'react'
import type { Message } from '@chat/contract'

export type ComposerStyles = {
  composer: string
  textarea: string
  send: string
  sendDisabled: string
}

export type ComposerProps = {
  input: string
  isStreaming: boolean
  canSend: boolean
  placeholderIdle: string
  placeholderStreaming: string
  styles: ComposerStyles
  onInputChange: (value: string) => void
  onSubmit: () => void
}

export type StreamingBubbleStyles = {
  row: string
  bubble: string
  status: string
}

export type StreamingBubbleProps = {
  streamingText: string | null
  toolLabel: string | null
  styles: StreamingBubbleStyles
}

export type MessagesAreaStyles = {
  messages: string
  empty: string
}

export type MessageComponentProps = {
  message: Message
  currentUserId: string
}

export type MessagesAreaProps = {
  emptyLabel: string
  MessageComponent: ComponentType<MessageComponentProps>
  styles: MessagesAreaStyles
  streamingBubbleStyles: StreamingBubbleStyles
}
