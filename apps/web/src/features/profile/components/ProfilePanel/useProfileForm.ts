import { useAuth } from '@/features/auth/context/auth.context'
import type { ProfileFormValue } from './ProfilePanel.types'

export function useProfileForm(): ProfileFormValue | null {
  const { user } = useAuth()

  return user == null ? null : { userName: user.name }
}
