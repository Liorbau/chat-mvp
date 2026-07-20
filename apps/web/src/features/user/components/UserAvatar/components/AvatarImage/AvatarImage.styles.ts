import type { AvatarSize } from '../../UserAvatar.types'
import { AVATAR_BASE_STYLE, AVATAR_SIZE_CLASS } from '../../UserAvatar.styles'

export function avatarImageClass(size: AvatarSize): string {
  return `${AVATAR_BASE_STYLE} ${AVATAR_SIZE_CLASS[size]}`
}
