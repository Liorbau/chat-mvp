import { useState } from 'react'
import type { User } from '@chat/contract'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'
import type { EmailFormValue } from './ProfilePanel.types'

export function useEmailForm(user: User | null): EmailFormValue {
  const save = useUpdateProfile()
  const [email, setEmail] = useState(user?.email ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  const changed = user !== null && email.trim().toLowerCase() !== user.email

  function submit(): void {
    setSubmitting(true)
    setErrors([])
    setSaved(false)
    void save({ email }).then((result) => {
      if (result.ok) {
        setSaved(true)
      } else {
        setErrors(result.errors)
      }
      setSubmitting(false)
    })
  }

  return {
    email,
    onEmailChange: (value) => {
      setEmail(value)
      setSaved(false)
    },
    submitting,
    errors,
    saved,
    changed,
    submit,
  }
}
