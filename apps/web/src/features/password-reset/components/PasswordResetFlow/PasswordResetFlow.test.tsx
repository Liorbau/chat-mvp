import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PasswordResetFlow } from './PasswordResetFlow'
import type { PasswordResetFlowView } from './PasswordResetFlow.types'

function buildView(overrides: Partial<PasswordResetFlowView> = {}): PasswordResetFlowView {
  return {
    step: 'request',
    email: '',
    onSent: vi.fn(),
    onAlreadyHaveCode: vi.fn(),
    onBackToRequest: vi.fn(),
    onExit: vi.fn(),
    ...overrides,
  }
}

describe('PasswordResetFlow', () => {
  it('renders the request step first', () => {
    render(<PasswordResetFlow {...buildView({ step: 'request' })} />)

    expect(screen.getByRole('heading', { name: 'Forgot password' })).toBeInTheDocument()
  })

  it('renders the confirm step once a code has been sent', () => {
    render(<PasswordResetFlow {...buildView({ step: 'confirm', email: 'alex@example.com' })} />)

    expect(screen.getByRole('heading', { name: 'Reset password' })).toBeInTheDocument()
  })
})
