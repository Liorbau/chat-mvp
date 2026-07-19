import { ModeSwitcher } from '@/features/app/components/ModeSwitcher/ModeSwitcher'
import { SwitchUserButton } from '@/features/app/components/SwitchUserButton/SwitchUserButton'
import { useAuth } from '@/features/auth/context/auth.context'
import { UserAvatar } from '@/features/user/components/UserAvatar/UserAvatar'
import { PERSISTENT_BUTTONS_STYLE } from './ChatLayout.constants'
import type { PersistentTopBarProps } from './ChatLayout.types'

export function PersistentTopBar({ mode, onSelectMode, onLogout }: PersistentTopBarProps) {
  const { user } = useAuth()

  return (
    <div className={PERSISTENT_BUTTONS_STYLE}>
      {user !== null ? <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="md" /> : null}
      <ModeSwitcher mode={mode} onSelect={onSelectMode} />
      <SwitchUserButton onClick={onLogout} />
    </div>
  )
}
