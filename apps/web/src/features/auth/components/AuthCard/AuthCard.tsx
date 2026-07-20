import {
  CARD_STYLE,
  SCREEN_STYLE,
  SUBTITLE_STYLE,
  TITLE_STYLE,
} from '@/features/auth/authForm.styles'
import type { AuthCardProps } from './AuthCard.types'

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className={SCREEN_STYLE}>
      <section className={CARD_STYLE}>
        <h1 className={TITLE_STYLE}>{title}</h1>
        <p className={SUBTITLE_STYLE}>{subtitle}</p>
        {children}
      </section>
    </main>
  )
}
