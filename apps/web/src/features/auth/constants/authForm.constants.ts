// Tailwind class strings shared by the auth screens (login + signup).
export const SCREEN_STYLE = 'min-h-screen flex items-center justify-center bg-[#f8fafc] px-6 py-8'

export const CARD_STYLE =
  'w-full max-w-[420px] bg-white border border-[#dbe3ee] rounded-2xl shadow-[0_14px_34px_rgba(15,23,42,0.08)] p-6'

export const FIELD_STYLE = 'grid gap-1.5 mt-3.5'

export const INPUT_STYLE =
  'h-10 rounded-[10px] border border-[#2563eb] bg-white text-[#0f172a] px-3 text-[15px]'

const BUTTON_STYLE =
  'mt-[18px] w-full h-[42px] rounded-[10px] border-0 bg-[#2563eb] text-white text-[15px] font-semibold cursor-pointer'

const BUTTON_DISABLED_STYLE = 'opacity-60 cursor-not-allowed'

export const SWITCH_BUTTON_STYLE =
  'mt-3.5 w-full bg-transparent border-0 text-[#2563eb] text-[14px] cursor-pointer'

export const TITLE_STYLE = 'm-0 text-[24px] text-[#2563eb]'
export const SUBTITLE_STYLE = 'mt-2 text-[#334155]'
export const ERROR_LIST_STYLE = 'list-disc text-[#b91c1c] mt-3 pl-[18px]'
export const HINT_STYLE = 'block text-[12px] text-[#64748b] mt-1'

export function submitButtonStyle(disabled: boolean): string {
  return disabled ? `${BUTTON_STYLE} ${BUTTON_DISABLED_STYLE}` : BUTTON_STYLE
}
