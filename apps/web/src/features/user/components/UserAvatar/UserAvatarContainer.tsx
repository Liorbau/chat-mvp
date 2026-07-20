import { useUserAvatar } from './hooks/useUserAvatar'
import { UserAvatar } from './UserAvatar'
import type { UserAvatarProps } from './UserAvatar.types'

export function UserAvatarContainer(props: UserAvatarProps) {
  const view = useUserAvatar(props)

  return <UserAvatar {...view} />
}
