import { UserAvatarContainer } from '@/features/user/components/UserAvatar/UserAvatarContainer'
import { useAvatarContext } from '../../../../AvatarSection.context'

export function AvatarPreview() {
  const { name, avatarUrl, onPreviewError } = useAvatarContext()

  return (
    <UserAvatarContainer name={name} avatarUrl={avatarUrl} size="lg" onError={onPreviewError} />
  )
}
