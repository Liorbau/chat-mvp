import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ApiRequestError, uploadAvatar, removeAvatar } from '@/api'
import { useAuth } from '@/features/auth/context/auth.context'
import { updateUser } from '@/shared/auth/authStorage'
import {
  ALLOWED_AVATAR_TYPES,
  AVATAR_MAX_BYTES,
  AVATAR_TOO_LARGE_MESSAGE,
  AVATAR_TYPE_MESSAGE,
} from '../AvatarSection.constants'

type UseAvatar = {
  name: string
  avatarUrl: string | null
  hasAvatar: boolean
  busy: boolean
  error: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onPickFile: () => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onDropFile: (file: File) => void
  onRemove: () => void
}

// Turns any thrown error into a specific, debuggable message.
function describeError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return `${error.message} (${error.code}, HTTP ${error.status})`
  }
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

export function useAvatar(): UseAvatar {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File): Promise<void> {
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError(AVATAR_TYPE_MESSAGE)
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setError(AVATAR_TOO_LARGE_MESSAGE)
      return
    }
    setBusy(true)
    setError(null)
    try {
      const updated = await uploadAvatar(file)
      updateUser(updated)
    } catch (err) {
      setError(`Could not upload your photo: ${describeError(err)}`)
    } finally {
      setBusy(false)
    }
  }

  async function remove(): Promise<void> {
    setBusy(true)
    setError(null)
    try {
      const updated = await removeAvatar()
      updateUser(updated)
    } catch (err) {
      setError(`Could not remove your photo: ${describeError(err)}`)
    } finally {
      setBusy(false)
    }
  }

  function onPickFile(): void {
    fileInputRef.current?.click()
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    if (file !== undefined) {
      void upload(file)
    }
    event.target.value = ''
  }

  function onDropFile(file: File): void {
    void upload(file)
  }

  function onRemove(): void {
    void remove()
  }

  return {
    name: user?.name ?? '',
    avatarUrl: user?.avatarUrl ?? null,
    hasAvatar: (user?.avatarUrl ?? null) !== null,
    busy,
    error,
    fileInputRef,
    onPickFile,
    onFileChange,
    onDropFile,
    onRemove,
  }
}
