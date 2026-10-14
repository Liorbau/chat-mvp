import type { AiMode } from '@/features/ai/types/ai.types'

export const ERROR_STYLE: Record<AiMode, string> = {
  assistant: 'mx-5 px-3 py-2 rounded-[10px] bg-[#7f1d1d] text-[#fee2e2] text-[13px]',
  tutor: 'mx-5 px-3 py-2 rounded-[10px] bg-[#450a0a] text-[#fecaca] text-[13px]',
}
