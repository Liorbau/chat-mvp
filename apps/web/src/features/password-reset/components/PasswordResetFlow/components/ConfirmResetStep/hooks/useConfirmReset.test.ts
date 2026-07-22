import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import * as passwordResetActions from '@/features/password-reset/apiActions/passwordReset'
import { useConfirmReset } from './useConfirmReset'

vi.mock('@/features/password-reset/apiActions/passwordReset', async (importActual) => {
  const actual =
    await importActual<typeof import('@/features/password-reset/apiActions/passwordReset')>()
  return { ...actual, confirmPasswordReset: vi.fn() }
})

const mockedConfirmPasswordReset = vi.mocked(passwordResetActions.confirmPasswordReset)

beforeEach(() => {
  mockedConfirmPasswordReset.mockReset()
})

describe('useConfirmReset', () => {
  it('seeds the email from the previous step', () => {
    const { result } = renderHook(() => useConfirmReset('alex@example.com'))

    expect(result.current.email).toBe('alex@example.com')
  })

  it('moves to the success state once the reset resolves', async () => {
    mockedConfirmPasswordReset.mockResolvedValue({ status: 'password_reset' })
    const { result } = renderHook(() => useConfirmReset('alex@example.com'))

    act(() => {
      result.current.onCodeChange('123456')
      result.current.onNewPasswordChange('brand-new-password')
    })
    act(() => {
      result.current.submit()
    })

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })
    expect(mockedConfirmPasswordReset).toHaveBeenCalledWith({
      email: 'alex@example.com',
      code: '123456',
      newPassword: 'brand-new-password',
    })
  })

  it('stays on the form and surfaces an error when the code is rejected', async () => {
    mockedConfirmPasswordReset.mockRejectedValue(new Error('bad code'))
    const { result } = renderHook(() => useConfirmReset('alex@example.com'))

    act(() => {
      result.current.submit()
    })

    await waitFor(() => {
      expect(result.current.errors.length).toBeGreaterThan(0)
    })
    expect(result.current.status).toBe('form')
    expect(result.current.submitting).toBe(false)
  })
})
