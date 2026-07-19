import { AvatarSection } from './AvatarSection'
import { useAvatar } from './hooks/useAvatar'

export function AvatarSectionContainer() {
  const avatar = useAvatar()
  return <AvatarSection {...avatar} />
}
