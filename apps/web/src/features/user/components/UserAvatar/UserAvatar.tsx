import { avatarFallbackClass, avatarImageClass, initialsFromName } from './UserAvatar.constants'
import type { UserAvatarProps } from './UserAvatar.types'

export function UserAvatar({ name, avatarUrl, size = 'md' }: UserAvatarProps) {
  if (avatarUrl !== null) {
    return <img src={avatarUrl} alt={name} className={avatarImageClass(size)} />
  }

  return (
    <span role="img" aria-label={name} className={avatarFallbackClass(size)}>
      {initialsFromName(name)}
    </span>
  )
}
