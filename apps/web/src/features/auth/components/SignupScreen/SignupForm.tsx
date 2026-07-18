import { AuthErrorList } from '@/features/auth/components/AuthErrorList/AuthErrorList'
import { AuthField } from '@/features/auth/components/AuthField/AuthField'
import { AuthHint } from '@/features/auth/components/AuthHint/AuthHint'
import { AuthSubmitButton } from '@/features/auth/components/AuthSubmitButton/AuthSubmitButton'
import { useSignupContext } from './SignupScreen.context'

export function SignupForm() {
  const {
    firstName,
    lastName,
    email,
    password,
    onFirstNameChange,
    onLastNameChange,
    onEmailChange,
    onPasswordChange,
    submitting,
    errors,
    submit,
  } = useSignupContext()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <AuthField
        label="First name"
        type="text"
        value={firstName}
        autoComplete="given-name"
        maxLength={100}
        onChange={onFirstNameChange}
      />
      <AuthField
        label="Last name"
        type="text"
        value={lastName}
        autoComplete="family-name"
        maxLength={100}
        onChange={onLastNameChange}
      />
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
        autoComplete="new-password"
        minLength={8}
        onChange={onPasswordChange}
      />
      <AuthHint>At least 8 characters.</AuthHint>
      <AuthErrorList errors={errors} />
      <AuthSubmitButton
        submitting={submitting}
        idleLabel="Sign up"
        busyLabel="Creating account..."
      />
    </form>
  )
}
