import { useFileDropzone } from '@/shared/hooks/useFileDropzone'
import { useAvatarContext } from '../../AvatarSection.context'
import { Dropzone } from './Dropzone'

export function DropzoneContainer() {
  const { busy, onPickFile, onDropFile } = useAvatarContext()
  const { isDragging, dropzoneProps } = useFileDropzone(onDropFile, busy)

  return (
    <Dropzone
      busy={busy}
      onPickFile={onPickFile}
      isDragging={isDragging}
      dropzoneProps={dropzoneProps}
    />
  )
}
