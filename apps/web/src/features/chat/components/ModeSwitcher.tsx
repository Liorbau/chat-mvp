import { type ReactNode, useState } from 'react'

export type ChatMode = 'chats' | 'assistant' | 'tutor' | 'profile'

// `plain` renders a bare icon (no gradient pill) with a faint hover glow.
type ModeDef = { key: ChatMode; label: string; gradient: string; icon: ReactNode; plain?: boolean }

function PersonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

const MODES: ModeDef[] = [
  {
    key: 'chats',
    label: 'Chats',
    gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
    icon: <PersonIcon />,
  },
  {
    key: 'assistant',
    label: 'Assistant',
    gradient: 'linear-gradient(135deg, #6366f1, #22d3ee)',
    icon: <span aria-hidden="true">✦</span>,
  },
  {
    key: 'tutor',
    label: 'Tutor',
    gradient: 'linear-gradient(135deg, #dc2626, #f97316)',
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

const WRAP_STYLE = { position: 'relative' as const, display: 'inline-flex' }
const BUTTON_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  color: '#ffffff',
  borderRadius: '8px',
  width: '40px',
  height: '34px',
  padding: 0,
  cursor: 'pointer',
  fontSize: '18px',
  lineHeight: 1,
}
const TOOLTIP_STYLE = {
  position: 'absolute' as const,
  top: '100%',
  right: 0,
  marginTop: '6px',
  whiteSpace: 'nowrap' as const,
  backgroundColor: '#0f172a',
  color: '#ffffff',
  fontSize: '12px',
  padding: '4px 8px',
  borderRadius: '6px',
  pointerEvents: 'none' as const,
}

function buttonStyle(def: ModeDef, hovered: boolean) {
  if (def.plain === true) {
    return {
      ...BUTTON_STYLE,
      background: 'transparent',
      color: '#2563eb',
      // Very faint blue glow on hover only.
      filter: hovered ? 'drop-shadow(0 0 3px rgba(37, 99, 235, 0.45))' : 'none',
    }
  }
  return { ...BUTTON_STYLE, background: def.gradient }
}

function ModeButton({ def, onSelect }: { def: ModeDef; onSelect: (mode: ChatMode) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={WRAP_STYLE}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        style={buttonStyle(def, hovered)}
        aria-label={`${def.label} mode`}
        onClick={() => onSelect(def.key)}
      >
        {def.icon}
      </button>
      {hovered ? (
        <span style={TOOLTIP_STYLE} role="tooltip">
          {def.label}
        </span>
      ) : null}
    </div>
  )
}

function ModeSwitcher({ mode, onSelect }: { mode: ChatMode; onSelect: (mode: ChatMode) => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {MODES.filter((def) => def.key !== mode).map((def) => (
        <ModeButton key={def.key} def={def} onSelect={onSelect} />
      ))}
    </div>
  )
}

export default ModeSwitcher
