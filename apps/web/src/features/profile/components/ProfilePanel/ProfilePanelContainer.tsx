import { ProfileFormContext } from './ProfilePanel.context'
import { ProfilePanel } from './ProfilePanel'
import { useProfileForm } from './useProfileForm'

export function ProfilePanelContainer() {
  const value = useProfileForm()

  return value === null ? null : (
    <ProfileFormContext.Provider value={value}>
      <ProfilePanel />
    </ProfileFormContext.Provider>
  )
}
