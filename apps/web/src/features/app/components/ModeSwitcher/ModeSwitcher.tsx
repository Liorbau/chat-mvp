import { useAuth } from '@/features/auth/context/auth.context'
import { UserAvatarContainer } from '@/features/user/components/UserAvatar/UserAvatarContainer'
import { ModeButton } from './ModeButton'
import { PersonIcon } from './PersonIcon'
import { ROW_STYLE } from './ModeSwitcher.styles'
import type { ModeDef, ModeSwitcherProps } from './ModeSwitcher.types'

function modeDefs(profileName: string, profileAvatarUrl: string | null): ModeDef[] {
  return [
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
      icon: <UserAvatarContainer name={profileName} avatarUrl={profileAvatarUrl} size="md" />,
      plain: true,
    },
  ]
}

export function ModeSwitcher({ mode, onSelect }: ModeSwitcherProps) {
  const { user } = useAuth()
  const profileName = user?.name ?? ''
  const profileAvatarUrl = user?.avatarUrl ?? null

  return (
    <div className={ROW_STYLE}>
      {modeDefs(profileName, profileAvatarUrl)
        .filter((def) => def.key !== mode)
        .map((def) => (
          <ModeButton key={def.key} def={def} onSelect={onSelect} />
        ))}
    </div>
  )
}
