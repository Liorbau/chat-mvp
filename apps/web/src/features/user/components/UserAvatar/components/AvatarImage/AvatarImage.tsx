import { avatarImageClass } from './AvatarImage.styles'
import type { AvatarImageProps } from './AvatarImage.types'

export function AvatarImage({ name, avatarUrl, size, onError }: AvatarImageProps) {
  return <img src={avatarUrl} alt={name} className={avatarImageClass(size)} onError={onError} />
}
