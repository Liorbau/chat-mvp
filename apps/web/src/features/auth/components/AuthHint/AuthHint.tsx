import type { ReactNode } from 'react'
import { HINT_STYLE } from '@/features/auth/constants/authForm.constants'

type AuthHintProps = {
  children: ReactNode
}

export function AuthHint({ children }: AuthHintProps) {
  return <span className={HINT_STYLE}>{children}</span>
}
