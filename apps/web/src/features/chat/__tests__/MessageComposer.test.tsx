import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageComposer from '../components/MessageComposer'

describe('MessageComposer', () => {
  it('disables the send button while the input is empty', () => {
    render(<MessageComposer onSend={vi.fn()} />)

    const sendButton = screen.getByRole('button', { name: 'Send message' })

    expect(sendButton).toBeDisabled()
  })

  it('submits trimmed content on Enter and clears the input on success', async () => {
    const user = userEvent.setup()
    const handleSend = vi.fn().mockResolvedValue(undefined)
    render(<MessageComposer onSend={handleSend} />)

    const textarea = screen.getByPlaceholderText('Type a message...')
    await user.click(textarea)
    await user.keyboard('  hello world  ')
    await user.keyboard('{Enter}')

    expect(handleSend).toHaveBeenCalledTimes(1)
    expect(handleSend).toHaveBeenCalledWith('hello world')
    expect(textarea).toHaveValue('')
  })

  it('Shift+Enter inserts a newline instead of submitting', async () => {
    const user = userEvent.setup()
    const handleSend = vi.fn().mockResolvedValue(undefined)
    render(<MessageComposer onSend={handleSend} />)

    const textarea = screen.getByPlaceholderText('Type a message...')
    await user.click(textarea)
    await user.keyboard('first line')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    await user.keyboard('second line')

    expect(handleSend).not.toHaveBeenCalled()
    expect(textarea).toHaveValue('first line\nsecond line')
  })

  it('does not call onSend when the content is only whitespace (validation)', async () => {
    const user = userEvent.setup()
    const handleSend = vi.fn().mockResolvedValue(undefined)
    render(<MessageComposer onSend={handleSend} />)

    const textarea = screen.getByPlaceholderText('Type a message...')
    await user.click(textarea)
    await user.keyboard('     ')
    await user.keyboard('{Enter}')

    expect(handleSend).not.toHaveBeenCalled()
  })

  it('keeps focus on the textarea after a successful send so the user can keep typing', async () => {
    const user = userEvent.setup()
    const handleSend = vi.fn().mockResolvedValue(undefined)
    render(<MessageComposer onSend={handleSend} />)

    const textarea = screen.getByPlaceholderText('Type a message...')
    await user.click(textarea)
    await user.keyboard('hello')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(textarea).toHaveValue('')
    })
    await waitFor(() => {
      expect(textarea).toHaveFocus()
    })

    await user.keyboard('again')
    expect(textarea).toHaveValue('again')
  })

  it('keeps the input content when onSend rejects so the user can retry', async () => {
    const user = userEvent.setup()
    const handleSend = vi.fn().mockRejectedValue(new Error('boom'))
    render(<MessageComposer onSend={handleSend} />)

    const textarea = screen.getByPlaceholderText('Type a message...')
    await user.click(textarea)
    await user.keyboard('retry me')
    await user.keyboard('{Enter}')

    expect(handleSend).toHaveBeenCalledWith('retry me')
    expect(textarea).toHaveValue('retry me')
  })
})
