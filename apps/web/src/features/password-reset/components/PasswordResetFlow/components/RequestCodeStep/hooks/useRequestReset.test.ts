import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import * as apiClient from '@/api'
import { useRequestReset } from './useRequestReset'

vi.mock('@/api', async (importActual) => {
  const actual = await importActual<typeof import('@/api')>()
  return { ...actual, requestPasswordReset: vi.fn() }
})

const mockedRequestPasswordReset = vi.mocked(apiClient.requestPasswordReset)

beforeEach(() => {
  mockedRequestPasswordReset.mockReset()
})

describe('useRequestReset', () => {
  it('advances with the normalized email once the request resolves', async () => {
    mockedRequestPasswordReset.mockResolvedValue({ status: 'reset_code_sent' })
    const onSent = vi.fn()
    const { result } = renderHook(() => useRequestReset(onSent))

    act(() => {
      result.current.onEmailChange('  ALEX@Example.com ')
    })
    act(() => {
      result.current.submit()
    })

    await waitFor(() => {
      expect(onSent).toHaveBeenCalledWith('alex@example.com')
    })
    expect(mockedRequestPasswordReset).toHaveBeenCalledWith({ email: '  ALEX@Example.com ' })
  })

  it('surfaces errors and stops submitting when the request fails', async () => {
    mockedRequestPasswordReset.mockRejectedValue(new Error('network down'))
    const onSent = vi.fn()
    const { result } = renderHook(() => useRequestReset(onSent))

    act(() => {
      result.current.submit()
    })

    await waitFor(() => {
      expect(result.current.errors.length).toBeGreaterThan(0)
    })
    expect(result.current.submitting).toBe(false)
    expect(onSent).not.toHaveBeenCalled()
  })
})
