import type { AiMode } from '@/features/ai/types/ai.types'

export const SEND_LABEL = 'Send'

export const IDLE_PLACEHOLDER: Record<AiMode, string> = {
  assistant: 'Message the assistant…',
  tutor: 'Ask about your notes…',
}

export const STREAMING_PLACEHOLDER: Record<AiMode, string> = {
  assistant: 'Waiting for the assistant…',
  tutor: 'Waiting for the tutor…',
}
