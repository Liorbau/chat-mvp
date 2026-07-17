export type AvatarSize = 'sm' | 'md' | 'lg'

export type UserAvatarProps = {
  name: string
  avatarUrl: string | null
  size?: AvatarSize
}
