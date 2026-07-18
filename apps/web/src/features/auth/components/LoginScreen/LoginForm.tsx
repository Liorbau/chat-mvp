import { AuthErrorList } from '@/features/auth/components/AuthErrorList/AuthErrorList'
import { AuthField } from '@/features/auth/components/AuthField/AuthField'
import { AuthSubmitButton } from '@/features/auth/components/AuthSubmitButton/AuthSubmitButton'
import { useLoginContext } from './LoginScreen.context'

export function LoginForm() {
  const { email, password, onEmailChange, onPasswordChange, submitting, errors, submit } =
    useLoginContext()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
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
