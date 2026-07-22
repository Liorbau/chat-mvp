import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PasswordResetFlow } from './PasswordResetFlow'
import { PasswordResetFlowContext } from './PasswordResetFlow.context'
import type { PasswordResetFlowContextValue } from './PasswordResetFlow.types'

function buildValue(
  overrides: Partial<PasswordResetFlowContextValue> = {},
): PasswordResetFlowContextValue {
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

function renderFlow(overrides: Partial<PasswordResetFlowContextValue> = {}): void {
  render(
    <PasswordResetFlowContext.Provider value={buildValue(overrides)}>
      <PasswordResetFlow />
    </PasswordResetFlowContext.Provider>,
  )
}

describe('PasswordResetFlow', () => {
  it('renders the request step first', () => {
    renderFlow({ step: 'request' })

    expect(screen.getByRole('heading', { name: 'Forgot password' })).toBeInTheDocument()
  })

  it('renders the confirm step once a code has been sent', () => {
    renderFlow({ step: 'confirm', email: 'alex@example.com' })

    expect(screen.getByRole('heading', { name: 'Reset password' })).toBeInTheDocument()
  })
})
