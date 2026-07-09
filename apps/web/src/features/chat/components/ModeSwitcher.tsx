import { type ReactNode, useState } from 'react'

export type ChatMode = 'chats' | 'assistant' | 'tutor'

type ModeDef = { key: ChatMode; label: string; gradient: string; icon: ReactNode }

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
        style={{ ...BUTTON_STYLE, background: def.gradient }}
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
