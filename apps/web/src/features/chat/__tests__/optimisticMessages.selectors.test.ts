import { describe, expect, it } from 'vitest'
import type { Message } from '../api/chatApi.types'
import type { OptimisticMessage } from '../hooks/optimisticMessages.types'
import {
  mergeOptimisticMessages,
  resolveOptimisticStatus,
  toPendingOptimisticMessages,
  toSentOptimisticMessages,
} from '../hooks/optimisticMessages.selectors'

function buildMessage(id: string, createdAt: string): Message {
  return {
    id,
    conversationId: 'conv-1',
    senderId: 'user-1',
    content: id,
    createdAt,
  }
}

describe('optimisticMessages.selectors', () => {
  it('toSentOptimisticMessages tags every message with deliveryStatus="sent"', () => {
    const result = toSentOptimisticMessages([
      buildMessage('msg-1', '2026-01-01T00:00:00.000Z'),
      buildMessage('msg-2', '2026-01-01T00:01:00.000Z'),
    ])

    expect(result.every((message) => message.deliveryStatus === 'sent')).toBe(true)
    expect(result.map((message) => message.id)).toEqual(['msg-1', 'msg-2'])
  })

  it('toPendingOptimisticMessages tags every message with deliveryStatus="pending"', () => {
    const result = toPendingOptimisticMessages([buildMessage('temp-1', '2026-01-01T00:02:00.000Z')])

    expect(result[0]?.deliveryStatus).toBe('pending')
  })

  it('mergeOptimisticMessages sorts merged messages by createdAt ascending', () => {
    const sentMessages: OptimisticMessage[] = [
      { ...buildMessage('msg-late', '2026-01-01T00:05:00.000Z'), deliveryStatus: 'sent' },
      { ...buildMessage('msg-early', '2026-01-01T00:00:00.000Z'), deliveryStatus: 'sent' },
    ]
    const pendingMessages: OptimisticMessage[] = [
      { ...buildMessage('temp-mid', '2026-01-01T00:02:00.000Z'), deliveryStatus: 'pending' },
    ]

    const result = mergeOptimisticMessages(sentMessages, pendingMessages)

    expect(result.map((message) => message.id)).toEqual(['msg-early', 'temp-mid', 'msg-late'])
  })

  it('resolveOptimisticStatus returns "idle" when no conversation is selected', () => {
    const result = resolveOptimisticStatus(null, 'success', [])
    expect(result).toBe('idle')
  })

  it('resolveOptimisticStatus upgrades to "success" when pending messages exist over a loading base', () => {
    const optimisticOnly: OptimisticMessage[] = [
      { ...buildMessage('temp-1', '2026-01-01T00:00:00.000Z'), deliveryStatus: 'pending' },
    ]

    const result = resolveOptimisticStatus('conv-1', 'loading', optimisticOnly)

    expect(result).toBe('success')
  })

  it('resolveOptimisticStatus passes through baseStatus when no upgrade applies', () => {
    expect(resolveOptimisticStatus('conv-1', 'error', [])).toBe('error')
    expect(resolveOptimisticStatus('conv-1', 'empty', [])).toBe('empty')
  })
})
