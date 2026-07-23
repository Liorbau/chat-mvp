import { useState } from 'react'
import type { User } from '@chat/contract'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'

export function useNameForm(user: User | null): {
  firstName: string
  lastName: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  submitting: boolean
  errors: string[]
  saved: boolean
  changed: boolean
  submit: () => void
} {
  const save = useUpdateProfile()
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  const changed =
    user != null && (firstName.trim() !== user.firstName || lastName.trim() !== user.lastName)

  function submit(): void {
    setSubmitting(true)
    setErrors([])
    setSaved(false)
    void save({ firstName, lastName }).then((result) => {
      if (result.ok) {
        setSaved(true)
      } else {
        setErrors(result.errors)
      }
      setSubmitting(false)
    })
  }

  return {
    firstName,
    lastName,
    onFirstNameChange: (value) => {
      setFirstName(value)
      setSaved(false)
    },
    onLastNameChange: (value) => {
      setLastName(value)
      setSaved(false)
    },
    submitting,
    errors,
    saved,
    changed,
    submit,
  }
}
