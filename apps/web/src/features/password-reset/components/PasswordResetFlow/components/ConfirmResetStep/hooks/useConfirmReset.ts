import { useState } from 'react'
import { confirmPasswordReset } from '@/features/password-reset/apiActions/passwordReset'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'

type ConfirmResetStatus = 'form' | 'success'

type UseConfirmReset = {
  email: string
  code: string
  newPassword: string
  onEmailChange: (value: string) => void
  onCodeChange: (value: string) => void
  onNewPasswordChange: (value: string) => void
  status: ConfirmResetStatus
  submitting: boolean
  errors: string[]
  submit: () => void
}

export function useConfirmReset(initialEmail: string): UseConfirmReset {
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState<ConfirmResetStatus>('form')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  function submit(): void {
    setSubmitting(true)
    setErrors([])
    void confirmPasswordReset({ email, code, newPassword })
      .then(() => {
        setStatus('success')
      })
      .catch((error: unknown) => {
        // One opaque message for every rejection (unknown email, wrong/expired/
        // used code) so confirm can't be used to probe which accounts exist.
        setErrors(toApiErrorMessages(error, { 401: 'That code is invalid or has expired.' }))
        setSubmitting(false)
      })
  }

  return {
    email,
    code,
    newPassword,
    onEmailChange: setEmail,
    onCodeChange: setCode,
    onNewPasswordChange: setNewPassword,
    status,
    submitting,
    errors,
    submit,
  }
}
