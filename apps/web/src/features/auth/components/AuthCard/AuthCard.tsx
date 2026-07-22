import { CARD_STYLE, SCREEN_STYLE } from '@/features/auth/authForm.styles'
import type { AuthCardProps } from './AuthCard.types'

export function AuthCard({ children }: AuthCardProps) {
  return (
    <main className={SCREEN_STYLE}>
      <section className={CARD_STYLE}>{children}</section>
    </main>
  )
}
