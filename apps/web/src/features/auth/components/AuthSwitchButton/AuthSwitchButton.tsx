import { SWITCH_BUTTON_STYLE } from '@/features/auth/constants/authForm.constants'

type AuthSwitchButtonProps = {
  label: string
  onClick: () => void
}

export function AuthSwitchButton({ label, onClick }: AuthSwitchButtonProps) {
  return (
    <button type="button" onClick={onClick} className={SWITCH_BUTTON_STYLE}>
      {label}
    </button>
  )
}
