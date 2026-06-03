import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { GetMessagesResponse, Message, SendMessageResponse } from '../api/chatApi.types'
import * as apiClient from '../api/apiClient'
import MessagePanelContainer from '../components/MessagePanelContainer'

vi.mock('../api/apiClient', () => {
  return {
    getConversations: vi.fn(),
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    login: vi.fn(),
  }
})

function buildMessage(
  id: string,
  createdAt: string,
  content: string,
  senderId = 'user-4',
): Message {
  return {
    id,
    conversationId: 'conv-1',
    senderId,
    content,
    createdAt,
  }
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const mockedGetMessages = vi.mocked(apiClient.getMessages)
const mockedSendMessage = vi.mocked(apiClient.sendMessage)

beforeEach(() => {
  mockedGetMessages.mockReset()
  mockedSendMessage.mockReset()
})

describe('MessagePanelContainer (status branches)', () => {
  it('renders a placeholder when no conversation is selected', () => {
    render(
      <MessagePanelContainer
        selectedConversationId={null}
        currentUserId="user-1"
        onConversationActivity={vi.fn()}
      />,
    )

    expect(screen.getByText('Select a conversation to view messages.')).toBeInTheDocument()
    expect(mockedGetMessages).not.toHaveBeenCalled()
  })

  it('renders the loading skeleton while messages are being fetched', () => {
    const deferred = createDeferred<GetMessagesResponse>()
    mockedGetMessages.mockReturnValue(deferred.promise)

    render(
      <MessagePanelContainer
        selectedConversationId="conv-1"
        currentUserId="user-1"
        onConversationActivity={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Loading messages')).toBeInTheDocument()
  })

  it('renders an empty state when the API returns no messages', async () => {
    mockedGetMessages.mockResolvedValue({ messages: [], nextCursor: null })

    render(
      <MessagePanelContainer
        selectedConversationId="conv-1"
        currentUserId="user-1"
        onConversationActivity={vi.fn()}
      />,
    )

    expect(await screen.findByText('No messages yet.')).toBeInTheDocument()
  })

  it('renders an error state with a retry button when the API rejects', async () => {
    mockedGetMessages.mockRejectedValueOnce(new Error('network down'))

    render(
      <MessagePanelContainer
        selectedConversationId="conv-1"
        currentUserId="user-1"
        onConversationActivity={vi.fn()}
      />,
    )

    expect(await screen.findByText('Failed to load messages')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('renders fetched messages on success', async () => {
    mockedGetMessages.mockResolvedValue({
      messages: [
        buildMessage('msg-1', '2026-01-01T00:00:00.000Z', 'first server message'),
        buildMessage('msg-2', '2026-01-01T00:01:00.000Z', 'second server message'),
      ],
      nextCursor: null,
    })

    render(
      <MessagePanelContainer
        selectedConversationId="conv-1"
        currentUserId="user-1"
        onConversationActivity={vi.fn()}
      />,
    )

    expect(await screen.findByText('first server message')).toBeInTheDocument()
    expect(screen.getByText('second server message')).toBeInTheDocument()
  })
})

describe('MessagePanelContainer (optimistic send)', () => {
  it('shows the message instantly and replaces the pending marker after a successful send', async () => {
    mockedGetMessages.mockResolvedValue({ messages: [], nextCursor: null })
    const deferredSend = createDeferred<SendMessageResponse>()
    mockedSendMessage.mockReturnValue(deferredSend.promise)

    const user = userEvent.setup()
    const handleConversationActivity = vi.fn()
    render(
      <MessagePanelContainer
        selectedConversationId="conv-1"
        currentUserId="user-1"
        onConversationActivity={handleConversationActivity}
      />,
    )

    await screen.findByText('No messages yet.')

    const composerTextarea = screen.getByPlaceholderText('Type a message...')
    await user.click(composerTextarea)
    await user.keyboard('hello there')
    await user.keyboard('{Enter}')

    expect(await screen.findByText('sending...')).toBeInTheDocument()
    expect(screen.getByText('hello there', { selector: 'span' })).toBeInTheDocument()

    deferredSend.resolve({
      message: buildMessage('msg-real', '2026-01-01T00:05:00.000Z', 'hello there', 'user-1'),
    })

    await waitFor(() => {
      expect(screen.queryByText('sending...')).not.toBeInTheDocument()
    })
    expect(screen.getByText('hello there', { selector: 'span' })).toBeInTheDocument()
    await waitFor(() => {
      expect(handleConversationActivity).toHaveBeenCalledWith('conv-1', 'hello there')
    })
  })

  it('rolls back the optimistic message and shows an error toast when send rejects', async () => {
    mockedGetMessages.mockResolvedValue({
      messages: [buildMessage('msg-1', '2026-01-01T00:00:00.000Z', 'existing server message')],
      nextCursor: null,
    })
    mockedSendMessage.mockRejectedValue(new Error('simulated failure'))

    const user = userEvent.setup()
    const handleConversationActivity = vi.fn()
    render(
      <MessagePanelContainer
        selectedConversationId="conv-1"
        currentUserId="user-1"
        onConversationActivity={handleConversationActivity}
      />,
    )

    await screen.findByText('existing server message')

    const composerTextarea = screen.getByPlaceholderText('Type a message...')
    await user.click(composerTextarea)
    await user.keyboard('please rollback')
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to send message')
    expect(screen.queryByText('please rollback', { selector: 'span' })).not.toBeInTheDocument()
    expect(screen.getByText('existing server message')).toBeInTheDocument()
    expect(handleConversationActivity).not.toHaveBeenCalled()
  })
})
