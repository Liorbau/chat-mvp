export const ALLOWED_AVATAR_CONTENT_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
]

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024

export const AVATAR_CACHE_CONTROL = 'public, max-age=31536000, immutable'

const AVATAR_PREFIX = 'avatars'

// One fixed object per user, overwritten on replace — so nothing is ever
// orphaned. Cache-busting is handled by a version query param on the read URL.
export function buildAvatarKey(userId: string): string {
  return `${AVATAR_PREFIX}/${userId}`
}
