import { useImageFallback } from '@/shared/hooks/useImageFallback'
import type { UserAvatarProps, UserAvatarView } from '../UserAvatar.types'

export function useUserAvatar({
  name,
  avatarUrl,
  size = 'md',
  onError,
}: UserAvatarProps): UserAvatarView {
  const fallback = useImageFallback(avatarUrl)

  function onImageError(): void {
    fallback.onError()
    onError?.()
  }

  return {
    name,
    size,
    imageUrl: avatarUrl != null && !fallback.failed ? avatarUrl : null,
    onImageError,
  }
}
