import type { AvatarSize } from '../../UserAvatar.types'

export type AvatarImageProps = {
  name: string
  avatarUrl: string
  size: AvatarSize
  onError: () => void
}
