import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import * as apiClient from '../api/apiClient'
import { useMessages } from '../hooks/useMessages'
import type { GetMessagesResponse, Message } from '../api/chatApi.types'

vi.mock('../api/apiClient', () => {
  return {
    getConversations: vi.fn(),
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    login: vi.fn(),
  }
})

function buildMessage(id: string, conversationId: string): Message {
  return {
    id,
    conversationId,
    senderId: 'user-1',
    content: id,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

const mockedGetMessages = vi.mocked(apiClient.getMessages)

beforeEach(() => {
  mockedGetMessages.mockReset()
})

describe('useMessages', () => {
  it('loads messages for the selected conversation', async () => {
    mockedGetMessages.mockResolvedValue({
      messages: [buildMessage('msg-1', 'conv-1')],
      nextCursor: null,
    })

    const { result } = renderHook(() => useMessages('conv-1'))

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })
    expect(result.current.messages.map((message) => message.id)).toEqual(['msg-1'])
  })

  it('ignores a slow response from a previous conversation after switching (race guard)', async () => {
    let resolvePreviousConversation: (value: GetMessagesResponse) => void = () => {}
    const previousConversationResponse = new Promise<GetMessagesResponse>((resolve) => {
      resolvePreviousConversation = resolve
    })

    mockedGetMessages.mockImplementation((conversationId: string) => {
      if (conversationId === 'conv-1') {
        return previousConversationResponse
      }

      return Promise.resolve({
        messages: [buildMessage('msg-from-conv-2', 'conv-2')],
        nextCursor: null,
      })
    })

    const { result, rerender } = renderHook(({ id }: { id: string }) => useMessages(id), {
      initialProps: { id: 'conv-1' },
    })

    rerender({ id: 'conv-2' })

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })
    expect(result.current.messages.map((message) => message.id)).toEqual(['msg-from-conv-2'])

    await act(async () => {
      resolvePreviousConversation({
        messages: [buildMessage('msg-from-conv-1', 'conv-1')],
        nextCursor: null,
      })
      await previousConversationResponse
    })

    expect(result.current.messages.map((message) => message.id)).toEqual(['msg-from-conv-2'])
  })
})
