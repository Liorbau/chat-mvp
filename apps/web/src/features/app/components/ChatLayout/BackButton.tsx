import { BACK_BUTTON_STYLE } from './ChatLayout.constants'
import type { BackButtonProps } from './ChatLayout.types'

// Thick blue left arrow that returns from the profile page to the prior mode.
export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button type="button" aria-label="Back" className={BACK_BUTTON_STYLE} onClick={onClick}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </button>
  )
}
