import type { ChatMode } from '@/features/app/components/ModeSwitcher/ModeSwitcher.types'

export type TopBarModeSwitcherProps = {
  mode: ChatMode
  onSelect: (mode: ChatMode) => void
}
