import { useAuth } from '@/features/auth/context/auth.context'
import type { ProfileFormValue } from './ProfilePanel.types'
import { useNameForm } from './useNameForm'

export function useProfileForm(): ProfileFormValue | null {
  const { user } = useAuth()
  const name = useNameForm(user)

  if (user == null) {
    return null
  }

  return { userName: user.name, name }
}
