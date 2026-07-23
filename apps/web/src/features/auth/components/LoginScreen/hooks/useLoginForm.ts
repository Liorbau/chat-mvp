import { useState } from 'react'
import { useAuth } from '@/features/auth/context/auth.context'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'
import type { LoginFormValue } from '../LoginScreen.types'

export function useLoginForm(): LoginFormValue {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  function submit(): void {
    setSubmitting(true)
    setErrors([])
    void signIn({ email, password }).catch((error: unknown) => {
      setErrors(toApiErrorMessages(error, { 401: 'Invalid email or password.' }))
      setSubmitting(false)
    })
  }

  return {
    email,
    password,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    submitting,
    errors,
    submit,
  }
}
