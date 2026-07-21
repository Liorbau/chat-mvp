import { useEffect, useState } from 'react'
import { confirmEmailChange } from '@/api'
import { loadAuth, updateUser } from '@/shared/auth/authStorage'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'
import type { ConfirmEmailStatus } from '../ConfirmEmailScreen.types'

type UseConfirmEmailChange = {
  status: ConfirmEmailStatus
  email: string | null
  error: string | null
}

export function useConfirmEmailChange(token: string): UseConfirmEmailChange {
  const [status, setStatus] = useState<ConfirmEmailStatus>('pending')
  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void confirmEmailChange({ token })
      .then((user) => {
        if (!active) {
          return
        }
        // If this browser holds that user's session, refresh it to the new email.
        const current = loadAuth()
        if (current != null && current.user.id === user.id) {
          updateUser(user)
        }
        setEmail(user.email)
        setStatus('success')
      })
      .catch((caught: unknown) => {
        if (!active) {
          return
        }
        setError(
          toApiErrorMessages(caught, {
            401: 'This confirmation link is invalid or has expired.',
          }).join(' '),
        )
        setStatus('invalid')
      })
    return () => {
      active = false
    }
  }, [token])

  return { status, email, error }
}
