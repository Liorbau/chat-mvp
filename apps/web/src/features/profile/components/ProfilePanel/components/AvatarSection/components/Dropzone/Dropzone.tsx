import { AvatarPreview } from './components/AvatarPreview/AvatarPreview'
import { DropzoneHint } from './components/DropzoneHint/DropzoneHint'
import { dropzoneClass } from './Dropzone.styles'
import type { DropzoneProps } from './Dropzone.types'

export function Dropzone({ busy, onPickFile, isDragging, dropzoneProps }: DropzoneProps) {
  return (
    <button
      type="button"
      className={dropzoneClass(isDragging)}
      onClick={onPickFile}
      disabled={busy}
      {...dropzoneProps}
    >
      <AvatarPreview />
      <DropzoneHint />
    </button>
  )
}
