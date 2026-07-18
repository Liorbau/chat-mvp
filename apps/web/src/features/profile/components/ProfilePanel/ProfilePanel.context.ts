import { createContext, useContext } from 'react'
import type { ProfileFormValue } from './ProfilePanel.types'

export const ProfileFormContext = createContext<ProfileFormValue | null>(null)

export function useProfileContext(): ProfileFormValue {
  const context = useContext(ProfileFormContext)
  if (context === null) {
    throw new Error('useProfileContext must be used within a ProfilePanelContainer')
  }

  return context
}
