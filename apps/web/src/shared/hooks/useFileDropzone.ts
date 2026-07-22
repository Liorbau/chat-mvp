import { useState } from 'react'
import type { DragEvent, DragEventHandler } from 'react'

type FileDropzone = {
  isDragging: boolean
  dropzoneProps: {
    onDragOver: DragEventHandler<HTMLElement>
    onDragLeave: DragEventHandler<HTMLElement>
    onDrop: DragEventHandler<HTMLElement>
  }
}

// Reusable drag-and-drop-a-file behavior; spread dropzoneProps onto the drop target.
export function useFileDropzone(onFile: (file: File) => void, disabled: boolean): FileDropzone {
  const [isDragging, setIsDragging] = useState(false)

  function onDragOver(event: DragEvent<HTMLElement>): void {
    event.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave(event: DragEvent<HTMLElement>): void {
    event.preventDefault()
    setIsDragging(false)
  }

  function onDrop(event: DragEvent<HTMLElement>): void {
    event.preventDefault()
    setIsDragging(false)
    if (disabled) {
      return
    }
    const file = event.dataTransfer.files?.[0]
    if (file) {
      onFile(file)
    }
  }

  return { isDragging, dropzoneProps: { onDragOver, onDragLeave, onDrop } }
}
