import type { AiMode } from '@/features/ai/types/ai.types'

export const EMPTY_LABEL: Record<AiMode, string> = {
  assistant: 'Ask me anything about your chats.',
  tutor: 'Ask a question about your uploaded notes.',
}
