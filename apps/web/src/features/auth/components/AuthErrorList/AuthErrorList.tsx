import { ERROR_LIST_STYLE } from '@/features/auth/constants/authForm.constants'

type AuthErrorListProps = {
  errors: string[]
}

export function AuthErrorList({ errors }: AuthErrorListProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <ul role="alert" className={ERROR_LIST_STYLE}>
      {errors.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  )
}
