import type { UpdateProfileRequest } from '@chat/contract'
import { useAuth } from '@/features/auth/context/auth.context'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'

export type SaveResult = { ok: true } | { ok: false; errors: string[] }

// Action hook: applies a profile update via the auth context (so the shared user
// refreshes live) and maps any failure to user-facing messages.
export function useUpdateProfile(): (payload: UpdateProfileRequest) => Promise<SaveResult> {
  const { updateProfile } = useAuth()
  return async (payload: UpdateProfileRequest): Promise<SaveResult> => {
    try {
      await updateProfile(payload)
      return { ok: true }
    } catch (error: unknown) {
      return {
        ok: false,
        errors: toApiErrorMessages(error, {
          409: 'An account with this email already exists.',
        }),
      }
    }
  }
}
