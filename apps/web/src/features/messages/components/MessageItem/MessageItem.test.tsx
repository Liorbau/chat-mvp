import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MessageItem } from './MessageItem'
import type { OptimisticMessage } from '@/features/messages/hooks/optimisticMessages.types'

function buildOptimisticMessage(overrides: Partial<OptimisticMessage> = {}): OptimisticMessage {
  return {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-2',
    content: 'hello world',
    createdAt: '2026-01-01T00:00:00.000Z',
    deliveryStatus: 'sent',
    ...overrides,
  }
}

describe('MessageItem', () => {
  it('renders the injected sender display name and content', () => {
    render(
      <MessageItem
        message={buildOptimisticMessage()}
        currentUserId="user-1"
        senderDisplayName="Sam"
      />,
    )

    expect(screen.getByText('Sam')).toBeInTheDocument()
    expect(screen.getByText('hello world')).toBeInTheDocument()
  })

  it('shows a pending marker only for pending messages', () => {
    const { rerender } = render(
      <MessageItem
        message={buildOptimisticMessage({ deliveryStatus: 'pending' })}
        currentUserId="user-1"
        senderDisplayName="Sam"
      />,
    )
    expect(screen.getByText('sending...')).toBeInTheDocument()

    rerender(
      <MessageItem
        message={buildOptimisticMessage({ deliveryStatus: 'sent' })}
        currentUserId="user-1"
        senderDisplayName="Sam"
      />,
    )
    expect(screen.queryByText('sending...')).not.toBeInTheDocument()
  })

  it('aligns the current user\u2019s own messages differently from others', () => {
    const { container, rerender } = render(
      <MessageItem
        message={buildOptimisticMessage({ senderId: 'user-1' })}
        currentUserId="user-1"
        senderDisplayName="Alex"
      />,
    )
    const ownRow = container.querySelector('li')
    expect(ownRow?.className).toContain('justify-start')

    rerender(
      <MessageItem
        message={buildOptimisticMessage({ senderId: 'user-2' })}
        currentUserId="user-1"
        senderDisplayName="Sam"
      />,
    )
    const otherRow = container.querySelector('li')
    expect(otherRow?.className).toContain('justify-end')
  })
})
