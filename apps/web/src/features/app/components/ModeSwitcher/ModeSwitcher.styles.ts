import type { ModeDef } from './ModeSwitcher.types'

export const ROW_STYLE = 'flex gap-2'

export const WRAP_STYLE = 'relative inline-flex'

const BUTTON_STYLE =
  'flex items-center justify-center border-0 rounded-lg w-10 h-[34px] p-0 cursor-pointer text-[18px] leading-none'

export const TOOLTIP_STYLE =
  'absolute top-full right-0 mt-1.5 whitespace-nowrap bg-[#0f172a] text-white text-[12px] px-2 py-1 rounded-md pointer-events-none'

export function buttonStyle(def: ModeDef, hovered: boolean): string {
  if (def.plain === true) {
    // Very faint blue glow on hover only.
    return `${BUTTON_STYLE} bg-transparent text-[#2563eb] ${hovered ? 'drop-shadow-[0_0_3px_rgba(37,99,235,0.45)]' : ''}`
  }
  return `${BUTTON_STYLE} text-white ${def.gradient}`
}
