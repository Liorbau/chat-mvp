import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as apiClient from '../api/apiClient'
import { ApiRequestError } from '../api/apiClient'
import { AuthProvider } from '../../auth/AuthProvider'
import SignupScreen from '../components/SignupScreen'

vi.mock('../api/apiClient', async (importActual) => {
  const actual = await importActual<typeof import('../api/apiClient')>()
  return { ...actual, login: vi.fn(), signup: vi.fn(), getUsers: vi.fn() }
})

function renderSignup() {
  render(
    <AuthProvider>
      <SignupScreen onSwitchToLogin={vi.fn()} />
    </AuthProvider>,
  )
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'New User')
  await user.type(screen.getByLabelText('Email'), 'new@example.com')
  await user.type(screen.getByLabelText('Password'), 'password123')
}

beforeEach(() => {
  localStorage.clear()
  vi.mocked(apiClient.signup).mockReset()
})

describe('SignupScreen', () => {
  it('submits name, email and password to sign up', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.signup).mockResolvedValue({
      token: 'tok',
      user: { id: 'user-9', name: 'New User', email: 'new@example.com' },
    })
    renderSignup()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(apiClient.signup).toHaveBeenCalledWith({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    })
  })

  it('renders field-level validation messages from a 400', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.signup).mockRejectedValue(
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
    vi.mocked(apiClient.signup).mockRejectedValue(
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
