import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as authActions from '@/features/auth/apiActions/auth'
import { ApiRequestError } from '@/api'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { SignupScreenContainer } from './SignupScreenContainer'

vi.mock('@/features/auth/apiActions/auth', async (importActual) => {
  const actual = await importActual<typeof import('@/features/auth/apiActions/auth')>()
  return { ...actual, login: vi.fn(), signup: vi.fn() }
})

function renderSignup() {
  render(
    <AuthProvider>
      <SignupScreenContainer onSwitchToLogin={vi.fn()} />
    </AuthProvider>,
  )
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('First name'), 'New')
  await user.type(screen.getByLabelText('Last name'), 'User')
  await user.type(screen.getByLabelText('Email'), 'new@example.com')
  await user.type(screen.getByLabelText('Password'), 'password123')
}

beforeEach(() => {
  localStorage.clear()
  vi.mocked(authActions.signup).mockReset()
})

describe('SignupScreen', () => {
  it('submits first name, last name, email and password to sign up', async () => {
    const user = userEvent.setup()
    vi.mocked(authActions.signup).mockResolvedValue({
      token: 'tok',
      user: {
        id: 'user-9',
        name: 'New User',
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        avatarUrl: null,
        previousEmails: [],
        subscription: { planKey: 'free', status: 'none' },
      },
    })
    renderSignup()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(authActions.signup).toHaveBeenCalledWith({
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      password: 'password123',
    })
  })

  it('renders field-level validation messages from a 400', async () => {
    const user = userEvent.setup()
    vi.mocked(authActions.signup).mockRejectedValue(
      new ApiRequestError(400, 'VALIDATION_ERROR', 'Invalid request', [
        'password must be longer than or equal to 8 characters',
      ]),
    )
    renderSignup()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'password must be longer than or equal to 8 characters',
    )
  })

  it('shows an email-exists message on a 409', async () => {
    const user = userEvent.setup()
    vi.mocked(authActions.signup).mockRejectedValue(
      new ApiRequestError(409, 'EMAIL_ALREADY_EXISTS', 'Email already registered', undefined),
    )
    renderSignup()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists.',
    )
  })
})
