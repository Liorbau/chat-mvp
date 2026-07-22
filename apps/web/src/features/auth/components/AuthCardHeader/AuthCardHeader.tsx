import { SUBTITLE_STYLE, TITLE_STYLE } from '@/features/auth/authForm.styles'
import type { AuthCardHeaderProps } from './AuthCardHeader.types'

export function AuthCardHeader({ title, subtitle }: AuthCardHeaderProps) {
  return (
    <>
      <h1 className={TITLE_STYLE}>{title}</h1>
      <p className={SUBTITLE_STYLE}>{subtitle}</p>
    </>
  )
}
