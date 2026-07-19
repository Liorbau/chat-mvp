export const AVATAR_MAX_BYTES = 5 * 1024 * 1024

export const AVATAR_CACHE_CONTROL = 'public, max-age=31536000, immutable'

const AVATAR_PREFIX = 'avatars'

// One fixed object per user, overwritten on replace
export function buildAvatarKey(userId: string): string {
  return `${AVATAR_PREFIX}/${userId}`
}
