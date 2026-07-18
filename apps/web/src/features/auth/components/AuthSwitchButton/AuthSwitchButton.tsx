import { SWITCH_BUTTON_STYLE } from '@/features/auth/constants/authForm.constants'
import type { AuthSwitchButtonProps } from './AuthSwitchButton.types'

export function AuthSwitchButton({ label, onClick }: AuthSwitchButtonProps) {
  return (
    <button type="button" onClick={onClick} className={SWITCH_BUTTON_STYLE}>
      {label}
    </button>
  )
}
