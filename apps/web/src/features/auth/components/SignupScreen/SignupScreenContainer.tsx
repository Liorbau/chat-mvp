import { useState } from 'react'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'
import { useAuth } from '@/features/auth/context/auth.context'
import { SignupScreen } from './SignupScreen'

type SignupScreenContainerProps = {
  onSwitchToLogin: () => void
}

export function SignupScreenContainer({ onSwitchToLogin }: SignupScreenContainerProps) {
  const { signUp } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  async function submit(): Promise<void> {
    setSubmitting(true)
    setErrors([])
    try {
      await signUp({ firstName, lastName, email, password })
    } catch (error: unknown) {
      setErrors(toApiErrorMessages(error, { 409: 'An account with this email already exists.' }))
      setSubmitting(false)
    }
  }

  return (
    <SignupScreen
      firstName={firstName}
      lastName={lastName}
      email={email}
      password={password}
      onFirstNameChange={setFirstName}
      onLastNameChange={setLastName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      submitting={submitting}
      errors={errors}
      onSubmit={() => {
        void submit()
      }}
      onSwitchToLogin={onSwitchToLogin}
    />
  )
}
