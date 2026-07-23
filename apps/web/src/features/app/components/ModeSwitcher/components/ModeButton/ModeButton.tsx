import { useState } from 'react'
import { buttonStyle, TOOLTIP_STYLE, WRAP_STYLE } from '../../ModeSwitcher.styles'
import type { ModeButtonProps } from '../../ModeSwitcher.types'

export function ModeButton({ def, onSelect }: ModeButtonProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={WRAP_STYLE}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className={buttonStyle(def, hovered)}
        aria-label={`${def.label} mode`}
        onClick={() => onSelect(def.key)}
      >
        {def.icon}
      </button>
      {hovered ? (
        <span className={TOOLTIP_STYLE} role="tooltip">
          {def.label}
        </span>
      ) : null}
    </div>
  )
}
