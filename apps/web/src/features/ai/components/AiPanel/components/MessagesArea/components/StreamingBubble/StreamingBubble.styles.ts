import { BASE_BUBBLE_STYLE } from '@/features/ai/components/AiPanel/components/MessagesArea/MessagesArea.styles'
import type { AiMode } from '@/features/ai/types/ai.types'

export const STREAMING_ROW_STYLE = 'flex justify-end'

export const STREAMING_BUBBLE_STYLE: Record<AiMode, string> = {
  assistant: `${BASE_BUBBLE_STYLE} bg-[#1e293b]`,
  tutor: `${BASE_BUBBLE_STYLE} bg-[#3b1418]`,
}
