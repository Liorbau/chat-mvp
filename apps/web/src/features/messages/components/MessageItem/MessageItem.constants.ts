export const MESSAGE_ROW_STYLE = 'flex'

export const BASE_BUBBLE_STYLE =
  'max-w-[70%] rounded-[18px] px-3.5 py-3 border border-[rgba(148,163,184,0.35)] backdrop-blur-[1px] text-[16px] leading-[1.45]'

export const SENDER_STYLE = 'block text-[11px] mb-1 opacity-75'

export const PENDING_STYLE = 'block mt-1.5 text-[11px] opacity-70'

// Bubble tint depends on author; kept as literal tokens so Tailwind generates them.
export const MINE_BUBBLE_STYLE = 'bg-[rgba(191,219,254,0.65)] text-[#0f172a]'
export const OTHER_BUBBLE_STYLE = 'bg-[rgba(255,255,255,0.72)] text-[#0f172a]'
