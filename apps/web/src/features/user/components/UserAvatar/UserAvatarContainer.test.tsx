import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { UserAvatarContainer } from './UserAvatarContainer'

describe('UserAvatarContainer', () => {
  it('renders the uploaded image when an avatarUrl is provided', () => {
    render(<UserAvatarContainer name="Alex Rivera" avatarUrl="https://cdn/x.png" />)

    const image = screen.getByRole('img', { name: 'Alex Rivera' })
    expect(image).toHaveAttribute('src', 'https://cdn/x.png')
  })

  it('falls back to initials from the name when there is no avatarUrl', () => {
    render(<UserAvatarContainer name="Alex Rivera" avatarUrl={null} />)

    expect(screen.getByText('AR')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Alex Rivera' })?.tagName).not.toBe('IMG')
  })

  it('uses a single initial for a one-word name', () => {
    render(<UserAvatarContainer name="Maya" avatarUrl={null} />)
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('falls back to initials when the image fails to load', () => {
    render(<UserAvatarContainer name="Alex Rivera" avatarUrl="https://cdn/broken.png" />)

    fireEvent.error(screen.getByRole('img', { name: 'Alex Rivera' }))

    expect(screen.getByText('AR')).toBeInTheDocument()
    expect(screen.queryByRole('img')?.tagName).not.toBe('IMG')
  })
})
