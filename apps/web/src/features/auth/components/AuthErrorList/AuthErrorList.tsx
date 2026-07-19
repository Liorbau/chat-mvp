import { ERROR_LIST_STYLE } from '@/features/auth/constants/authForm.constants'
import type { AuthErrorListProps } from './AuthErrorList.types'

export function AuthErrorList({ errors }: AuthErrorListProps) {
  return errors.length === 0 ? null : (
    <ul role="alert" className={ERROR_LIST_STYLE}>
      {errors.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  )
}
