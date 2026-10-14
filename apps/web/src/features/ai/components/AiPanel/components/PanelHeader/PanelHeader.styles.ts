import type { AiMode } from '@/features/ai/types/ai.types'

export const HEADER_STYLE: Record<AiMode, string> = {
  assistant: 'flex items-center gap-3 px-5 py-4 border-b border-[#1e293b]',
  tutor: 'flex items-center gap-3 px-5 py-4 border-b border-[#4c1d24]',
}

export const AVATAR_STYLE: Record<AiMode, string> = {
  assistant:
    'w-[34px] h-[34px] rounded-full bg-[linear-gradient(135deg,#6366f1,#22d3ee)] flex items-center justify-center text-[18px]',
  tutor:
    'w-[34px] h-[34px] rounded-full bg-[linear-gradient(135deg,#dc2626,#f97316)] flex items-center justify-center text-[18px]',
}

export const HEADER_TITLE_STYLE = 'text-[16px]'
