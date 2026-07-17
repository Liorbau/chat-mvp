import { useState } from 'react'
import type { DragEvent } from 'react'
import { UserAvatar } from '@/features/user/components/UserAvatar/UserAvatar'
import {
  ACTIONS_STYLE,
  AVATAR_ACCEPT,
  BUTTON_ROW_STYLE,
  DROPZONE_ACTIVE_STYLE,
  DROPZONE_HINT_STYLE,
  DROPZONE_STYLE,
  ERROR_STYLE,
  REMOVE_BUTTON_STYLE,
  SECTION_STYLE,
  UPLOAD_BUTTON_STYLE,
} from './AvatarSection.constants'
import type { AvatarSectionProps } from './AvatarSection.types'

export function AvatarSection({
  name,
  avatarUrl,
  hasAvatar,
  busy,
  error,
  fileInputRef,
  onPickFile,
  onFileChange,
  onDropFile,
  onRemove,
}: AvatarSectionProps) {
  const [isDragging, setIsDragging] = useState(false)

  function handleDragOver(event: DragEvent<HTMLButtonElement>): void {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLButtonElement>): void {
    event.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>): void {
    event.preventDefault()
    setIsDragging(false)
    if (busy) {
      return
    }
    const file = event.dataTransfer.files?.[0]
    if (file !== undefined) {
      onDropFile(file)
    }
  }

  const dropzoneStyle = isDragging ? `${DROPZONE_STYLE} ${DROPZONE_ACTIVE_STYLE}` : DROPZONE_STYLE

  return (
    <div className={SECTION_STYLE}>
      <button
        type="button"
        className={dropzoneStyle}
        onClick={onPickFile}
        disabled={busy}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UserAvatar name={name} avatarUrl={avatarUrl} size="lg" />
        <span className={DROPZONE_HINT_STYLE}>{busy ? 'Working…' : 'Drag & drop or click'}</span>
      </button>
      <div className={ACTIONS_STYLE}>
        <div className={BUTTON_ROW_STYLE}>
          <button
            type="button"
            className={UPLOAD_BUTTON_STYLE}
            onClick={onPickFile}
            disabled={busy}
          >
            {hasAvatar ? 'Change photo' : 'Upload photo'}
          </button>
          {hasAvatar ? (
            <button
              type="button"
              className={REMOVE_BUTTON_STYLE}
              onClick={onRemove}
              disabled={busy}
            >
              Remove
            </button>
          ) : null}
        </div>
        {error !== null ? <p className={ERROR_STYLE}>{error}</p> : null}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={AVATAR_ACCEPT}
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  )
}
