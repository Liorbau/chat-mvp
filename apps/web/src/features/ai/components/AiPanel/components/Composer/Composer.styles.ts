import type { AiMode } from '@/features/ai/types/ai.types'

export const COMPOSER_STYLE: Record<AiMode, string> = {
  assistant: 'flex gap-2.5 px-5 py-4 border-t border-[#1e293b]',
  tutor: 'flex gap-2.5 px-5 py-4 border-t border-[#4c1d24]',
}

export const TEXTAREA_STYLE: Record<AiMode, string> = {
  assistant:
    'flex-1 box-border rounded-[14px] border border-[#334155] bg-[#111c30] text-[#e2e8f0] px-3.5 py-3 text-[15px] resize-none outline-none',
  tutor:
    'flex-1 box-border rounded-[14px] border border-[#4c1d24] bg-[#2a1416] text-[#fecaca] px-3.5 py-3 text-[15px] resize-none outline-none',
}

const SEND_STYLE: Record<AiMode, string> = {
  assistant:
    'self-end rounded-xl border-0 px-4 py-2.5 text-[15px] text-white bg-[#6366f1] cursor-pointer',
  tutor:
    'self-end rounded-xl border-0 px-4 py-2.5 text-[15px] text-white bg-[#dc2626] cursor-pointer',
}

const SEND_DISABLED_STYLE: Record<AiMode, string> = {
  assistant: 'bg-[#475569] text-[#cbd5e1] cursor-not-allowed',
  tutor: 'bg-[#7f1d1d] text-[#fca5a5] cursor-not-allowed',
}

export function sendButtonClass(mode: AiMode, canSend: boolean): string {
  return canSend ? SEND_STYLE[mode] : `${SEND_STYLE[mode]} ${SEND_DISABLED_STYLE[mode]}`
}
