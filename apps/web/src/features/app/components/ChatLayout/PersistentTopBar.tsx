import { SwitchUserButton } from '@/features/app/components/SwitchUserButton/SwitchUserButton'
import { TopBarModeSwitcher } from './components/TopBarModeSwitcher/TopBarModeSwitcher'
import { PERSISTENT_BUTTONS_STYLE } from './ChatLayout.styles'
import type { PersistentTopBarProps } from './ChatLayout.types'

export function PersistentTopBar({ mode, onSelectMode, onLogout }: PersistentTopBarProps) {
  return (
    <div className={PERSISTENT_BUTTONS_STYLE}>
      <TopBarModeSwitcher mode={mode} onSelect={onSelectMode} />
      <SwitchUserButton onClick={onLogout} />
    </div>
  )
}
