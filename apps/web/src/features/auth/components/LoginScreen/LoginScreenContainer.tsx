import { useState } from 'react'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'
import { useAuth } from '@/features/auth/context/auth.context'
import { LoginScreen } from './LoginScreen'

type LoginScreenContainerProps = {
  onSwitchToSignup: () => void
}

export function LoginScreenContainer({ onSwitchToSignup }: LoginScreenContainerProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  async function submit(): Promise<void> {
    setSubmitting(true)
    setErrors([])
    try {
      await signIn({ email, password })
    } catch (error: unknown) {
      setErrors(toApiErrorMessages(error, { 401: 'Invalid email or password.' }))
      setSubmitting(false)
    }
  }

  return (
    <LoginScreen
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      submitting={submitting}
      errors={errors}
      onSubmit={() => {
        void submit()
      }}
      onSwitchToSignup={onSwitchToSignup}
    />
  )
}
