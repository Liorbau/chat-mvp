import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserAvatar } from './UserAvatar'

describe('UserAvatar', () => {
  it('renders the uploaded image when an avatarUrl is provided', () => {
    render(<UserAvatar name="Alex Rivera" avatarUrl="https://cdn/x.png" />)

    const image = screen.getByRole('img', { name: 'Alex Rivera' })
    expect(image).toHaveAttribute('src', 'https://cdn/x.png')
  })

  it('falls back to initials from the name when there is no avatarUrl', () => {
    render(<UserAvatar name="Alex Rivera" avatarUrl={null} />)

    expect(screen.getByText('AR')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Alex Rivera' })?.tagName).not.toBe('IMG')
  })

  it('uses a single initial for a one-word name', () => {
    render(<UserAvatar name="Maya" avatarUrl={null} />)
    expect(screen.getByText('M')).toBeInTheDocument()
  })
})
