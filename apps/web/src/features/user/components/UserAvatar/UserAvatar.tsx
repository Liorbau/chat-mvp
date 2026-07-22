import { AvatarImage } from './components/AvatarImage/AvatarImage'
import { AvatarFallback } from './components/AvatarFallback/AvatarFallback'
import type { UserAvatarView } from './UserAvatar.types'

export function UserAvatar({ name, size, imageUrl, onImageError }: UserAvatarView) {
  return imageUrl == null ? (
    <AvatarFallback name={name} size={size} />
  ) : (
    <AvatarImage name={name} avatarUrl={imageUrl} size={size} onError={onImageError} />
  )
}
