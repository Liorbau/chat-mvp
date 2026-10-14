import { BASE_BUBBLE_STYLE } from '@/features/ai/components/AiPanel/components/MessagesArea/MessagesArea.styles'
import type { AiMode } from '@/features/ai/types/ai.types'

export const SENDER_LABEL_STYLE = 'block text-[11px] opacity-70 mb-[3px]'

const MINE_BUBBLE_COLORS: Record<AiMode, string> = {
  assistant: 'bg-[#6366f1] text-white',
  tutor: 'bg-[#dc2626] text-white',
}

const OTHER_BUBBLE_COLORS: Record<AiMode, string> = {
  assistant: 'bg-[#1e293b] text-[#e2e8f0]',
  tutor: 'bg-[#3b1418] text-[#fecaca]',
}

export function rowClass(mine: boolean): string {
  return mine ? 'flex justify-start' : 'flex justify-end'
}

export function bubbleClass(mode: AiMode, mine: boolean): string {
  const colors = mine ? MINE_BUBBLE_COLORS[mode] : OTHER_BUBBLE_COLORS[mode]
  return `${BASE_BUBBLE_STYLE} ${colors}`
}
