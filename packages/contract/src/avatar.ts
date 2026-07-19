export type AvatarResponse = {
  avatarUrl: string | null
}

// Avatar upload limits — enforced on both the client and the API (contract-first).
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024
export const ALLOWED_AVATAR_MIME_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
]

// Rejection copy shared so client- and API-caught errors read identically.
export const AVATAR_TOO_LARGE_MESSAGE = 'Image is too large. Please choose a file under 5 MB.'
export const AVATAR_TYPE_MESSAGE = 'Unsupported image type. Use PNG, JPEG, or WEBP.'
