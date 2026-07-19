import { useAuth } from '@/features/auth/context/auth.context'
import type { ProfileFormValue } from './ProfilePanel.types'
import { useEmailForm } from './useEmailForm'
import { useNameForm } from './useNameForm'

// Composes the name + email form hooks into the value behind ProfileFormContext.
// Returns null until the authenticated user is known (profile only renders in).
export function useProfileForm(): ProfileFormValue | null {
  const { user } = useAuth()
  const name = useNameForm(user)
  const email = useEmailForm(user)

  if (user === null) {
    return null
  }

  return { userName: user.name, name, email }
}
