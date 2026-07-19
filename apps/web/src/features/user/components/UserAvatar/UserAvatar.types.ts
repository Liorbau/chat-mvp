export type AvatarSize = 'sm' | 'md' | 'lg'

export type UserAvatarProps = {
  name: string
  avatarUrl: string | null
  size?: AvatarSize
  onError?: () => void
}

export type UserAvatarView = {
  name: string
  size: AvatarSize
  imageUrl: string | null
  onImageError: () => void
}
