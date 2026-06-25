import { useState } from 'react'

type ModeToggleButtonProps = {
  mode: 'chats' | 'assistant'
  onToggle: () => void
}

const WRAP_STYLE = { position: 'relative' as const, display: 'inline-flex' }

const TOGGLE_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '7px 10px',
  cursor: 'pointer',
}

// Custom tooltip instead of the native `title` (no OS hover delay, always shows).
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

// Same star glyph as the assistant avatar in the panel header.
function SparkleIcon() {
  return (
    <span aria-hidden="true" style={{ fontSize: '18px', lineHeight: 1 }}>
      ✦
    </span>
  )
}

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

// One button for both modes: sparkle = enter assistant, person = back to chats.
function ModeToggleButton({ mode, onToggle }: ModeToggleButtonProps) {
  const isAssistant = mode === 'assistant'
  const label = isAssistant ? 'Back to chats' : 'Assistant mode'
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={WRAP_STYLE}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button type="button" style={TOGGLE_STYLE} onClick={onToggle} aria-label={label}>
        {isAssistant ? <PersonIcon /> : <SparkleIcon />}
      </button>
      {hovered ? (
        <span style={TOOLTIP_STYLE} role="tooltip">
          {label}
        </span>
      ) : null}
    </div>
  )
}

export default ModeToggleButton
