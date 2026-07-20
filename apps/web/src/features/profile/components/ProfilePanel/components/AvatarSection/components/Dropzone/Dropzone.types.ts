import type { useFileDropzone } from '@/shared/hooks/useFileDropzone'

// The drag fields (isDragging, dropzoneProps) are derived from the hook so they can't drift.
export type DropzoneProps = {
  busy: boolean
  onPickFile: () => void
} & ReturnType<typeof useFileDropzone>
