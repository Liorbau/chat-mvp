import { ModeSwitcher } from '@/features/app/components/ModeSwitcher/ModeSwitcher'
import { useAuth } from '@/features/auth/context/auth.context'
import type { TopBarModeSwitcherProps } from './TopBarModeSwitcher.types'

export function TopBarModeSwitcher({ mode, onSelect }: TopBarModeSwitcherProps) {
  const { user } = useAuth()

  return user == null ? null : <ModeSwitcher mode={mode} onSelect={onSelect} />
}
