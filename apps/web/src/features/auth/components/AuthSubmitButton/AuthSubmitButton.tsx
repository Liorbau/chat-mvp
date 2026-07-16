import { submitButtonStyle } from '@/features/auth/constants/authForm.constants'

type AuthSubmitButtonProps = {
  submitting: boolean
  idleLabel: string
  busyLabel: string
}

export function AuthSubmitButton({ submitting, idleLabel, busyLabel }: AuthSubmitButtonProps) {
  return (
    <button type="submit" disabled={submitting} className={submitButtonStyle(submitting)}>
      {submitting ? busyLabel : idleLabel}
    </button>
  )
}
