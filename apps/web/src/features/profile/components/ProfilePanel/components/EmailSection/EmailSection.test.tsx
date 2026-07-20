import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { EmailChangeContext } from './EmailSection.context'
import { EmailSection } from './EmailSection'
import type { EmailChangeContextValue } from './EmailSection.types'

function renderSection(overrides: Partial<EmailChangeContextValue> = {}): EmailChangeContextValue {
  const value: EmailChangeContextValue = {
    currentEmail: 'alex@example.com',
    previousEmails: [],
    hasPreviousEmails: false,
    newEmail: '',
    onNewEmailChange: vi.fn(),
    errors: [],
    disabled: true,
    submitLabel: 'Send confirmation',
    sentTo: null,
    submit: vi.fn(),
    ...overrides,
  }

  render(
    <EmailChangeContext.Provider value={value}>
      <EmailSection />
    </EmailChangeContext.Provider>,
  )

  return value
}

describe('EmailSection', () => {
  it('shows the current email', () => {
    renderSection()

    expect(screen.getByText('Current: alex@example.com')).toBeInTheDocument()
  })

  it('disables the submit button when disabled', () => {
    renderSection({ disabled: true })

    expect(screen.getByRole('button', { name: 'Send confirmation' })).toBeDisabled()
  })

  it('submits when the form is submitted', () => {
    const value = renderSection({ disabled: false, newEmail: 'new@example.com' })

    fireEvent.submit(document.querySelector('form') as HTMLFormElement)

    expect(value.submit).toHaveBeenCalledTimes(1)
  })

  it('shows the confirmation notice after a request is sent', () => {
    renderSection({ sentTo: 'new@example.com' })

    expect(screen.getByText(/Confirmation sent to new@example\.com/)).toBeInTheDocument()
  })

  it('renders the previous emails when present', () => {
    renderSection({
      hasPreviousEmails: true,
      previousEmails: ['old1@example.com', 'old2@example.com'],
    })

    expect(screen.getByText('old1@example.com')).toBeInTheDocument()
    expect(screen.getByText('old2@example.com')).toBeInTheDocument()
  })

  it('renders request errors', () => {
    renderSection({ errors: ['An account with this email already exists.'] })

    expect(screen.getByText('An account with this email already exists.')).toBeInTheDocument()
  })
})
