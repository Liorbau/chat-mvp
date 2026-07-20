import { AvatarContext } from './AvatarSection.context'
import { useAvatar } from './hooks/useAvatar'
import { AvatarSection } from './AvatarSection'

export function AvatarSectionContainer() {
  const value = useAvatar()

  return (
    <AvatarContext.Provider value={value}>
      <AvatarSection />
    </AvatarContext.Provider>
  )
}
