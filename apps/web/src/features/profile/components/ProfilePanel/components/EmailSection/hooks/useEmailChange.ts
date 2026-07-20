import { useState } from 'react'
import { requestEmailChange } from '@/api'
import { useAuth } from '@/features/auth/context/auth.context'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'
import type { EmailChangeContextValue } from '../EmailSection.types'

export function useEmailChange(): EmailChangeContextValue {
  const { user } = useAuth()
  const [newEmail, setNewEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [sentTo, setSentTo] = useState<string | null>(null)

  const currentEmail = user?.email ?? ''
  const previousEmails = user?.previousEmails ?? []
  const hasPreviousEmails = previousEmails.length > 0
  const normalized = newEmail.trim().toLowerCase()
  const changed = normalized.length > 0 && normalized !== currentEmail
  const disabled = submitting || !changed
  const submitLabel = submitting ? 'Sending...' : 'Send confirmation'

  function submit(): void {
    setSubmitting(true)
    setErrors([])
    setSentTo(null)
    void requestEmailChange({ newEmail })
      .then(() => {
        setSentTo(normalized)
        setNewEmail('')
      })
      .catch((error: unknown) => {
        setErrors(
          toApiErrorMessages(error, {
            400: 'That is already your email address. Enter a different one.',
            409: 'That email is already in use by another account.',
          }),
        )
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return {
    currentEmail,
    previousEmails,
    hasPreviousEmails,
    newEmail,
    onNewEmailChange: (value) => {
      setNewEmail(value)
      setSentTo(null)
    },
    errors,
    disabled,
    submitLabel,
    sentTo,
    submit,
  }
}
