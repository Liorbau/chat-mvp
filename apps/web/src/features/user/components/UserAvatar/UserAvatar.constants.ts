import type { AvatarSize } from './UserAvatar.types'

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-9 w-9 text-sm',
  lg: 'h-24 w-24 text-2xl',
}

const BASE_STYLE = 'inline-flex shrink-0 items-center justify-center rounded-full object-cover'
const FALLBACK_STYLE = 'bg-[#2563eb] font-semibold text-white select-none'

export function avatarImageClass(size: AvatarSize): string {
  return `${BASE_STYLE} ${SIZE_CLASS[size]}`
}

export function avatarFallbackClass(size: AvatarSize): string {
  return `${BASE_STYLE} ${FALLBACK_STYLE} ${SIZE_CLASS[size]}`
}

// First letters of the first and last word (e.g. "Alex Rivera" -> "AR"); "?" when empty.
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : ''
  return (first + last).toUpperCase()
}
