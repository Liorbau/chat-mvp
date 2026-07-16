import type { RefObject } from 'react'
import type { Citation, Message } from '@chat/contract'

export type TutorPanelProps = {
  currentUserId: string
}

export type TutorPanelViewProps = {
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

export type TutorMessageProps = {
  message: Message
  currentUserId: string
}

export type TutorSourcesProps = {
  citations: Citation[]
}

export type TutorStreamingBubbleProps = {
  streamingText: string | null
  toolLabel: string | null
}

export type TutorComposerProps = {
  input: string
  isStreaming: boolean
  canSend: boolean
  onInputChange: (value: string) => void
  onSubmit: () => void
}
