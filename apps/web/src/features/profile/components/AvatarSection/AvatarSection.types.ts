import type { ChangeEvent, RefObject } from 'react'

export type AvatarSectionProps = {
  name: string
  avatarUrl: string | null
  hasAvatar: boolean
  busy: boolean
  error: string | null
  fileInputRef: RefObject<HTMLInputElement | null>
  onPickFile: () => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onDropFile: (file: File) => void
  onRemove: () => void
}
