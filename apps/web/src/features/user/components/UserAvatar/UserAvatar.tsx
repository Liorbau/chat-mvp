import { AvatarImage } from './components/AvatarImage/AvatarImage'
import { AvatarFallback } from './components/AvatarFallback/AvatarFallback'
import type { UserAvatarView } from './UserAvatar.types'

export function UserAvatar({ name, size, imageUrl, onImageError }: UserAvatarView) {
  if (imageUrl === null) {
    return <AvatarFallback name={name} size={size} />
  }

  return <AvatarImage name={name} avatarUrl={imageUrl} size={size} onError={onImageError} />
}
