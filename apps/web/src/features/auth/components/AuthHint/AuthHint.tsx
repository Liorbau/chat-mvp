import { HINT_STYLE } from '@/features/auth/constants/authForm.constants'
import type { AuthHintProps } from './AuthHint.types'

export function AuthHint({ children }: AuthHintProps) {
  return <span className={HINT_STYLE}>{children}</span>
}
