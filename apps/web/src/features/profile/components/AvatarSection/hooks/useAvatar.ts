import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { uploadAvatar, removeAvatar } from '@/api'
import { useAuth } from '@/features/auth/context/auth.context'
import { updateUser } from '@/shared/auth/authStorage'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'
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

function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return AVATAR_TYPE_MESSAGE
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return AVATAR_TOO_LARGE_MESSAGE
  }
  return null
}

export function useAvatar(): UseAvatar {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File): Promise<void> {
    if (user === null) {
      return
    }
    const validationError = validateAvatarFile(file)
    if (validationError !== null) {
      setError(validationError)
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { avatarUrl } = await uploadAvatar(file)
      updateUser({ ...user, avatarUrl })
    } catch (err) {
      setError(`Could not upload your photo. ${toApiErrorMessages(err).join(' ')}`)
    } finally {
      setBusy(false)
    }
  }

  async function remove(): Promise<void> {
    if (user === null) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { avatarUrl } = await removeAvatar()
      updateUser({ ...user, avatarUrl })
    } catch (err) {
      setError(`Could not remove your photo. ${toApiErrorMessages(err).join(' ')}`)
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
