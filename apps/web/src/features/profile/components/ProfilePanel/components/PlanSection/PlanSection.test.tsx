import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PlanContext } from './PlanSection.context'
import { PlanSection } from './PlanSection'
import type { PlanContextValue } from './PlanSection.types'

function renderSection(overrides: Partial<PlanContextValue> = {}): PlanContextValue {
  const value: PlanContextValue = {
    currentPlanName: 'Free',
    isPro: false,
    upgradeLabel: 'Upgrade to Pro — $9.00',
    disabled: false,
    notice: null,
    errors: [],
    upgrade: vi.fn(),
    ...overrides,
  }

  render(
    <PlanContext.Provider value={value}>
      <PlanSection />
    </PlanContext.Provider>,
  )

  return value
}

describe('PlanSection', () => {
  it('shows the current plan name', () => {
    renderSection({ currentPlanName: 'Free' })

    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('renders the upgrade button with the price label when not pro', () => {
    renderSection({ isPro: false })

    expect(screen.getByRole('button', { name: 'Upgrade to Pro — $9.00' })).toBeInTheDocument()
  })

  it('hides the upgrade button when already pro', () => {
    renderSection({ isPro: true, currentPlanName: 'Pro' })

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('starts the upgrade when the button is clicked', () => {
    const value = renderSection({ disabled: false })

    fireEvent.click(screen.getByRole('button', { name: 'Upgrade to Pro — $9.00' }))

    expect(value.upgrade).toHaveBeenCalledTimes(1)
  })

  it('disables the upgrade button while redirecting', () => {
    renderSection({ disabled: true, upgradeLabel: 'Redirecting…' })

    expect(screen.getByRole('button', { name: 'Redirecting…' })).toBeDisabled()
  })

  it('shows a return notice when present', () => {
    renderSection({ notice: 'Payment received — your Pro upgrade is processing.' })

    expect(
      screen.getByText('Payment received — your Pro upgrade is processing.'),
    ).toBeInTheDocument()
  })

  it('renders request errors', () => {
    renderSection({ errors: ['Could not start the upgrade. Please try again.'] })

    expect(screen.getByText('Could not start the upgrade. Please try again.')).toBeInTheDocument()
  })
})
