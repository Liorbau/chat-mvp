import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useImageFallback } from './useImageFallback'

describe('useImageFallback', () => {
  it('marks the current url failed after onError and clears for a new url', () => {
    const { result, rerender } = renderHook((url: string | null) => useImageFallback(url), {
      initialProps: 'https://cdn/a' as string | null,
    })

    expect(result.current.failed).toBe(false)

    act(() => {
      result.current.onError()
    })
    expect(result.current.failed).toBe(true)

    rerender('https://cdn/b')
    expect(result.current.failed).toBe(false)
  })
})
