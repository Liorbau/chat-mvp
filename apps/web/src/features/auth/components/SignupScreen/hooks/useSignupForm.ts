import { useState } from 'react'
import { useAuth } from '@/features/auth/context/auth.context'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'
import type { SignupFormValue } from '../SignupScreen.types'

export function useSignupForm(): SignupFormValue {
  const { signUp } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  function submit(): void {
    setSubmitting(true)
    setErrors([])
    void signUp({ firstName, lastName, email, password }).catch((error: unknown) => {
      setErrors(toApiErrorMessages(error, { 409: 'An account with this email already exists.' }))
      setSubmitting(false)
    })
  }

  return {
    firstName,
    lastName,
    email,
    password,
    onFirstNameChange: setFirstName,
    onLastNameChange: setLastName,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    submitting,
    errors,
    submit,
  }
}
