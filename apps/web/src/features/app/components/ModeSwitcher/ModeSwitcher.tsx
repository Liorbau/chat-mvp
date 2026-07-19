import { GearIcon } from './GearIcon'
import { ModeButton } from './ModeButton'
import { PersonIcon } from './PersonIcon'
import type { ModeDef, ModeSwitcherProps } from './ModeSwitcher.types'

const MODES: ModeDef[] = [
  {
    key: 'chats',
    label: 'Chats',
    gradient: 'bg-[linear-gradient(135deg,#64748b,#94a3b8)]',
    icon: <PersonIcon />,
  },
  {
    key: 'assistant',
    label: 'Assistant',
    gradient: 'bg-[linear-gradient(135deg,#6366f1,#22d3ee)]',
    icon: <span aria-hidden="true">✦</span>,
  },
  {
    key: 'tutor',
    label: 'Tutor',
    gradient: 'bg-[linear-gradient(135deg,#dc2626,#f97316)]',
    icon: <span aria-hidden="true">📖</span>,
  },
  {
    key: 'profile',
    label: 'Profile',
    gradient: '',
    icon: <GearIcon />,
    plain: true,
  },
]

export function ModeSwitcher({ mode, onSelect }: ModeSwitcherProps) {
  return (
    <div className="flex gap-2">
      {MODES.filter((def) => def.key !== mode).map((def) => (
        <ModeButton key={def.key} def={def} onSelect={onSelect} />
      ))}
    </div>
  )
}
