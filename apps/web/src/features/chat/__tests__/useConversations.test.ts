import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import * as apiClient from '../api/apiClient'
import { useConversations } from '../hooks/useConversations'
import type { Conversation } from '../api/chatApi.types'

vi.mock('../api/apiClient', () => {
  return {
    getConversations: vi.fn(),
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  }
})

function buildConversation(id: string, updatedAt: string): Conversation {
  return {
    id,
    title: id,
    participantIds: ['user-1'],
    lastMessagePreview: 'preview',
    updatedAt,
  }
}

const mockedGetConversations = vi.mocked(apiClient.getConversations)

beforeEach(() => {
  mockedGetConversations.mockReset()
})

describe('useConversations', () => {
  it('sorts conversations by most recent activity on load', async () => {
    mockedGetConversations.mockResolvedValue([
      buildConversation('conv-old', '2026-01-01T00:00:00.000Z'),
      buildConversation('conv-new', '2026-01-03T00:00:00.000Z'),
      buildConversation('conv-mid', '2026-01-02T00:00:00.000Z'),
    ])

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })
    expect(result.current.conversations.map((conversation) => conversation.id)).toEqual([
      'conv-new',
      'conv-mid',
      'conv-old',
    ])
  })

  it('moves a conversation to the top and updates its preview when it gets new activity', async () => {
    mockedGetConversations.mockResolvedValue([
      buildConversation('conv-new', '2026-01-03T00:00:00.000Z'),
      buildConversation('conv-mid', '2026-01-02T00:00:00.000Z'),
      buildConversation('conv-old', '2026-01-01T00:00:00.000Z'),
    ])

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    act(() => {
      result.current.markConversationActivity('conv-old', 'newest message')
    })

    expect(result.current.conversations.map((conversation) => conversation.id)).toEqual([
      'conv-old',
      'conv-new',
      'conv-mid',
    ])
    expect(result.current.conversations[0]?.lastMessagePreview).toBe('newest message')
  })

  it('is a no-op for an unknown conversation id (edge case)', async () => {
    mockedGetConversations.mockResolvedValue([
      buildConversation('conv-a', '2026-01-02T00:00:00.000Z'),
      buildConversation('conv-b', '2026-01-01T00:00:00.000Z'),
    ])

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    act(() => {
      result.current.markConversationActivity('conv-does-not-exist', 'ignored')
    })

    expect(result.current.conversations.map((conversation) => conversation.id)).toEqual([
      'conv-a',
      'conv-b',
    ])
  })
})
