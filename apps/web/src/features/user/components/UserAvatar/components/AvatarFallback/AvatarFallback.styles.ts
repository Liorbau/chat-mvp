import type { AvatarSize } from '../../UserAvatar.types'
import { AVATAR_BASE_STYLE, AVATAR_SIZE_CLASS } from '../../UserAvatar.styles'

const FALLBACK_STYLE = 'bg-[#2563eb] font-semibold text-white select-none'

export function avatarFallbackClass(size: AvatarSize): string {
  return `${AVATAR_BASE_STYLE} ${FALLBACK_STYLE} ${AVATAR_SIZE_CLASS[size]}`
}
