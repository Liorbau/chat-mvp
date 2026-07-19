import type { AvatarSize } from './UserAvatar.types'

// Shared by both the image and the initials fallback so their shape/size stay in sync.
export const AVATAR_BASE_STYLE =
  'inline-flex shrink-0 items-center justify-center rounded-full object-cover'

export const AVATAR_SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-9 w-9 text-sm',
  lg: 'h-24 w-24 text-2xl',
}
