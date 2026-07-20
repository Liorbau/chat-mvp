import { act, renderHook } from '@testing-library/react'
import type { DragEvent } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useFileDropzone } from './useFileDropzone'

function dragEvent(file?: File): DragEvent<HTMLElement> {
  return {
    preventDefault: vi.fn(),
    dataTransfer: { files: file === undefined ? [] : [file] },
  } as unknown as DragEvent<HTMLElement>
}

describe('useFileDropzone', () => {
  it('toggles isDragging on drag over then leave', () => {
    const { result } = renderHook(() => useFileDropzone(vi.fn(), false))

    act(() => {
      result.current.dropzoneProps.onDragOver(dragEvent())
    })
    expect(result.current.isDragging).toBe(true)

    act(() => {
      result.current.dropzoneProps.onDragLeave(dragEvent())
    })
    expect(result.current.isDragging).toBe(false)
  })

  it('passes the dropped file to onFile when enabled', () => {
    const onFile = vi.fn()
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    const { result } = renderHook(() => useFileDropzone(onFile, false))

    act(() => {
      result.current.dropzoneProps.onDrop(dragEvent(file))
    })
    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('ignores the drop while disabled', () => {
    const onFile = vi.fn()
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    const { result } = renderHook(() => useFileDropzone(onFile, true))

    act(() => {
      result.current.dropzoneProps.onDrop(dragEvent(file))
    })
    expect(onFile).not.toHaveBeenCalled()
  })
})
