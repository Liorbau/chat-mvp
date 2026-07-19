import { submitButtonStyle } from '@/features/auth/constants/authForm.constants'
import type { AuthSubmitButtonProps } from './AuthSubmitButton.types'

export function AuthSubmitButton({ submitting, idleLabel, busyLabel }: AuthSubmitButtonProps) {
  return (
    <button type="submit" disabled={submitting} className={submitButtonStyle(submitting)}>
      {submitting ? busyLabel : idleLabel}
    </button>
  )
}
