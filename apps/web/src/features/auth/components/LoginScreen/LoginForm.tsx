import { AuthErrorList } from '@/features/auth/components/AuthErrorList/AuthErrorList'
import { AuthField } from '@/features/auth/components/AuthField/AuthField'
import { AuthSubmitButton } from '@/features/auth/components/AuthSubmitButton/AuthSubmitButton'

type LoginFormProps = {
  email: string
  password: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  submitting: boolean
  errors: string[]
  onSubmit: () => void
}

export function LoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  submitting,
  errors,
  onSubmit,
}: LoginFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <AuthField
        label="Email"
        type="email"
        value={email}
        autoComplete="email"
        onChange={onEmailChange}
      />
      <AuthField
        label="Password"
        type="password"
        value={password}
        autoComplete="current-password"
        onChange={onPasswordChange}
      />
      <AuthErrorList errors={errors} />
      <AuthSubmitButton submitting={submitting} idleLabel="Log in" busyLabel="Logging in..." />
    </form>
  )
}
