import { STYLE } from './SwitchUserButton.constants'
import type { SwitchUserButtonProps } from './SwitchUserButton.types'

export function SwitchUserButton({ onClick }: SwitchUserButtonProps) {
  return (
    <button type="button" className={STYLE} onClick={onClick}>
      Switch user
    </button>
  )
}
