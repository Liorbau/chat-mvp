import { useState } from 'react'
import { useAuth } from '@/features/auth/context/auth.context'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'
import { ProfilePanel } from './ProfilePanel'

// Container: owns form state + save orchestration, hands plain values to the view.
export function ProfilePanelContainer() {
  const { user } = useAuth()
  const save = useUpdateProfile()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [nameSubmitting, setNameSubmitting] = useState(false)
  const [nameErrors, setNameErrors] = useState<string[]>([])
  const [nameSaved, setNameSaved] = useState(false)

  const [email, setEmail] = useState(user?.email ?? '')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailErrors, setEmailErrors] = useState<string[]>([])
  const [emailSaved, setEmailSaved] = useState(false)

  if (user === null) {
    return null
  }

  const nameChanged = firstName.trim() !== user.firstName || lastName.trim() !== user.lastName
  const emailChanged = email.trim().toLowerCase() !== user.email

  async function submitName(): Promise<void> {
    setNameSubmitting(true)
    setNameErrors([])
    setNameSaved(false)
    const result = await save({ firstName, lastName })
    if (result.ok) {
      setNameSaved(true)
    } else {
      setNameErrors(result.errors)
    }
    setNameSubmitting(false)
  }

  async function submitEmail(): Promise<void> {
    setEmailSubmitting(true)
    setEmailErrors([])
    setEmailSaved(false)
    const result = await save({ email })
    if (result.ok) {
      setEmailSaved(true)
    } else {
      setEmailErrors(result.errors)
    }
    setEmailSubmitting(false)
  }

  return (
    <ProfilePanel
      userName={user.name}
      name={{
        firstName,
        lastName,
        onFirstNameChange: (value) => {
          setFirstName(value)
          setNameSaved(false)
        },
        onLastNameChange: (value) => {
          setLastName(value)
          setNameSaved(false)
        },
        submitting: nameSubmitting,
        errors: nameErrors,
        saved: nameSaved,
        changed: nameChanged,
        onSubmit: () => {
          void submitName()
        },
      }}
      email={{
        email,
        onEmailChange: (value) => {
          setEmail(value)
          setEmailSaved(false)
        },
        submitting: emailSubmitting,
        errors: emailErrors,
        saved: emailSaved,
        changed: emailChanged,
        onSubmit: () => {
          void submitEmail()
        },
      }}
    />
  )
}
