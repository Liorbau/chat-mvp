import type { RefObject } from 'react'
import type { Message } from '@chat/contract'

// Shared value behind both the assistant and tutor panels (identical composer
// behavior; only the view chrome differs).
export type ComposerValue = {
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
  submit: () => void
}
