import { avatarFallbackClass } from './AvatarFallback.styles'
import { initialsFromName } from './AvatarFallback.utils'
import type { AvatarFallbackProps } from './AvatarFallback.types'

export function AvatarFallback({ name, size }: AvatarFallbackProps) {
  return (
    <span role="img" aria-label={name} className={avatarFallbackClass(size)}>
      {initialsFromName(name)}
    </span>
  )
}
