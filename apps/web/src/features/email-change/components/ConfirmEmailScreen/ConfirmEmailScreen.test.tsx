import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ConfirmEmailContext } from './ConfirmEmailScreen.context'
import { ConfirmEmailScreen } from './ConfirmEmailScreen'
import type { ConfirmEmailContextValue } from './ConfirmEmailScreen.types'

function renderScreen(overrides: Partial<ConfirmEmailContextValue> = {}): ConfirmEmailContextValue {
  const value: ConfirmEmailContextValue = {
    status: 'pending',
    email: null,
    error: null,
    onDone: vi.fn(),
    ...overrides,
  }

  render(
    <ConfirmEmailContext.Provider value={value}>
      <ConfirmEmailScreen />
    </ConfirmEmailContext.Provider>,
  )

  return value
}

describe('ConfirmEmailScreen', () => {
  it('shows a pending message while confirming', () => {
    renderScreen({ status: 'pending' })

    expect(screen.getByText('Confirming your new email…')).toBeInTheDocument()
  })

  it('shows the new email on success', () => {
    renderScreen({ status: 'success', email: 'new@example.com' })

    expect(screen.getByText(/Your email is now new@example\.com/)).toBeInTheDocument()
  })

  it('shows the error on an invalid token', () => {
    renderScreen({ status: 'invalid', error: 'This confirmation link is invalid or has expired.' })

    expect(
      screen.getByText('This confirmation link is invalid or has expired.'),
    ).toBeInTheDocument()
  })

  it('calls onDone from the Continue button', () => {
    const value = renderScreen({ status: 'success', email: 'x@example.com' })

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(value.onDone).toHaveBeenCalledTimes(1)
  })
})
