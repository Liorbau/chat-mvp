import type { ReactNode } from 'react'

export type ChatMode = 'chats' | 'assistant' | 'tutor' | 'profile'

// `plain` renders a bare icon (no gradient pill) with a faint hover glow.
export type ModeDef = {
  key: ChatMode
  label: string
  gradient: string
  icon: ReactNode
  plain?: boolean
}

export type ModeButtonProps = {
  def: ModeDef
  onSelect: (mode: ChatMode) => void
}

export type ModeSwitcherProps = {
  mode: ChatMode
  onSelect: (mode: ChatMode) => void
}
