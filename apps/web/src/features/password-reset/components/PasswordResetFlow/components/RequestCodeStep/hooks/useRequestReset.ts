import { useState } from 'react'
import { requestPasswordReset } from '@/features/password-reset/apiActions/passwordReset'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'

type UseRequestReset = {
  email: string
  onEmailChange: (value: string) => void
  submitting: boolean
  errors: string[]
  submit: () => void
}

export function useRequestReset(onSent: (email: string) => void): UseRequestReset {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  function submit(): void {
    setSubmitting(true)
    setErrors([])
    const normalized = email.trim().toLowerCase()
    // The API responds identically whether or not the account exists, so success
    // here never confirms an account — it just advances to the code-entry step.
    void requestPasswordReset({ email })
      .then(() => {
        onSent(normalized)
      })
      .catch((error: unknown) => {
        setErrors(toApiErrorMessages(error))
        setSubmitting(false)
      })
  }

  return { email, onEmailChange: setEmail, submitting, errors, submit }
}
