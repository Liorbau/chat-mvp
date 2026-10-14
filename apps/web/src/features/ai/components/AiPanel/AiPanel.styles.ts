import type { AiMode } from '@/features/ai/types/ai.types'

export const PANEL_STYLE: Record<AiMode, string> = {
  assistant: 'flex flex-col h-screen w-full bg-[#0b1220] text-[#e2e8f0]',
  tutor: 'flex flex-col h-screen w-full bg-[#1a0e10] text-[#fecaca]',
}
