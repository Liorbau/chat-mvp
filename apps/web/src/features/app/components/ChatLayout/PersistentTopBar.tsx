import { ModeSwitcher } from '@/features/app/components/ModeSwitcher/ModeSwitcher'
import { SwitchUserButton } from '@/features/app/components/SwitchUserButton/SwitchUserButton'
import { PERSISTENT_BUTTONS_STYLE } from './ChatLayout.constants'
import type { PersistentTopBarProps } from './ChatLayout.types'

export function PersistentTopBar({ mode, onSelectMode, onLogout }: PersistentTopBarProps) {
  return (
    <div className={PERSISTENT_BUTTONS_STYLE}>
      <ModeSwitcher mode={mode} onSelect={onSelectMode} />
      <SwitchUserButton onClick={onLogout} />
    </div>
  )
}
