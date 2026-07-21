import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as apiClient from '@/api'
import { ApiRequestError } from '@/api'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { LoginScreenContainer } from './LoginScreenContainer'

vi.mock('@/api', async (importActual) => {
  const actual = await importActual<typeof import('@/api')>()
  return { ...actual, login: vi.fn(), signup: vi.fn(), getUsers: vi.fn() }
})

function renderLogin() {
  render(
    <AuthProvider>
      <LoginScreenContainer onSwitchToSignup={vi.fn()} onForgotPassword={vi.fn()} />
    </AuthProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.mocked(apiClient.login).mockReset()
})

describe('LoginScreen', () => {
  it('submits email and password to sign in', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.login).mockResolvedValue({
      token: 'tok',
      user: {
        id: 'user-1',
        name: 'Alex Rivera',
        firstName: 'Alex',
        lastName: 'Rivera',
        email: 'alex@example.com',
        avatarUrl: null,
        previousEmails: [],
      },
    })
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'alex@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(apiClient.login).toHaveBeenCalledWith({
      email: 'alex@example.com',
      password: 'password123',
    })
  })

  it('shows a friendly message on invalid credentials (401)', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.login).mockRejectedValue(
      new ApiRequestError(401, 'UNAUTHORIZED', 'Invalid credentials', undefined),
    )
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'alex@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.')
  })

  it('renders field-level validation messages from a 400', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.login).mockRejectedValue(
      new ApiRequestError(400, 'VALIDATION_ERROR', 'Invalid request', [
        'password must be longer than or equal to 8 characters',
      ]),
    )
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'alex@example.com')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'password must be longer than or equal to 8 characters',
    )
  })
})
