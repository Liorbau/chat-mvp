import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AvatarContext } from './AvatarSection.context'
import { AvatarSection } from './AvatarSection'
import type { AvatarContextValue } from './AvatarSection.types'
import { AVATAR_PREVIEW_ERROR_MESSAGE } from './components/AvatarActions/components/PreviewWarning/PreviewWarning.constants'

function renderSection(overrides: Partial<AvatarContextValue> = {}): AvatarContextValue {
  const value: AvatarContextValue = {
    name: 'Alex Rivera',
    avatarUrl: null,
    hasAvatar: false,
    busy: false,
    error: null,
    previewFailed: false,
    onPreviewError: vi.fn(),
    fileInputRef: createRef<HTMLInputElement>(),
    onPickFile: vi.fn(),
    onFileChange: vi.fn(),
    onDropFile: vi.fn(),
    onRemove: vi.fn(),
    ...overrides,
  }

  render(
    <AvatarContext.Provider value={value}>
      <AvatarSection />
    </AvatarContext.Provider>,
  )

  return value
}

describe('AvatarSection', () => {
  it('shows "Upload photo" and no Remove button when there is no avatar', () => {
    renderSection({ hasAvatar: false })

    expect(screen.getByRole('button', { name: 'Upload photo' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
  })

  it('shows "Change photo" and a Remove button when there is an avatar', () => {
    renderSection({ hasAvatar: true, avatarUrl: 'https://cdn/x.png' })

    expect(screen.getByRole('button', { name: 'Change photo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('calls onPickFile when the upload button is clicked', () => {
    const value = renderSection()

    fireEvent.click(screen.getByRole('button', { name: 'Upload photo' }))

    expect(value.onPickFile).toHaveBeenCalledTimes(1)
  })

  it('calls onRemove when the remove button is clicked', () => {
    const value = renderSection({ hasAvatar: true, avatarUrl: 'https://cdn/x.png' })

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

    expect(value.onRemove).toHaveBeenCalledTimes(1)
  })

  it('renders the error message only when there is an error', () => {
    renderSection({ error: 'Could not upload your photo.' })

    expect(screen.getByText('Could not upload your photo.')).toBeInTheDocument()
  })

  it('renders the preview warning only when the preview failed', () => {
    renderSection({ previewFailed: true })

    expect(screen.getByText(AVATAR_PREVIEW_ERROR_MESSAGE)).toBeInTheDocument()
  })

  it('shows the working hint while busy', () => {
    renderSection({ busy: true })

    expect(screen.getByText('Working…')).toBeInTheDocument()
  })

  it('forwards file selection to onFileChange', () => {
    const value = renderSection()
    const input = document.querySelector('input[type="file"]')
    expect(input).not.toBeNull()

    fireEvent.change(input as HTMLInputElement)

    expect(value.onFileChange).toHaveBeenCalledTimes(1)
  })
})
