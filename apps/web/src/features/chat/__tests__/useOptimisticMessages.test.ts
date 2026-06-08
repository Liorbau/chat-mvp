import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import * as apiClient from '../api/apiClient'
import { useOptimisticMessages } from '../hooks/useOptimisticMessages'
import type { GetMessagesResponse, Message, SendMessageResponse } from '../api/chatApi.types'

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
  content: string = id,
  senderId: string = 'user-1',
): Message {
  return {
    id,
    conversationId: 'conv-1',
    senderId,
    content,
    createdAt,
  }
}

const mockedGetMessages = vi.mocked(apiClient.getMessages)
const mockedSendMessage = vi.mocked(apiClient.sendMessage)

beforeEach(() => {
  mockedGetMessages.mockReset()
  mockedSendMessage.mockReset()
})

describe('useOptimisticMessages (renderHook)', () => {
  it('loads base messages and tags them with deliveryStatus="sent"', async () => {
    const response: GetMessagesResponse = {
      messages: [buildMessage('msg-1', '2026-01-01T00:00:00.000Z', 'one', 'user-4')],
      nextCursor: null,
    }
    mockedGetMessages.mockResolvedValue(response)

    const { result } = renderHook(() => useOptimisticMessages('conv-1', 'user-1'))

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]?.deliveryStatus).toBe('sent')
    expect(result.current.error).toBeNull()
  })

  it('optimistically appends a pending message and replaces it on send success (explicit act)', async () => {
    mockedGetMessages.mockResolvedValue({ messages: [], nextCursor: null })
    const sendResponse: SendMessageResponse = {
      message: buildMessage('msg-real', '2026-01-01T00:05:00.000Z', 'hello', 'user-1'),
    }
    mockedSendMessage.mockResolvedValue(sendResponse)

    const { result } = renderHook(() => useOptimisticMessages('conv-1', 'user-1'))
    await waitFor(() => {
      expect(result.current.status).toBe('empty')
    })

    await act(async () => {
      await result.current.sendMessage('hello')
    })

    expect(mockedSendMessage).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      content: 'hello',
    })
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]?.id).toBe('msg-real')
    expect(result.current.messages[0]?.deliveryStatus).toBe('sent')
    expect(result.current.error).toBeNull()
  })

  it('rolls back the optimistic message and exposes an error on send failure (explicit act)', async () => {
    mockedGetMessages.mockResolvedValue({ messages: [], nextCursor: null })
    mockedSendMessage.mockRejectedValue(new Error('simulated network failure'))

    const { result } = renderHook(() => useOptimisticMessages('conv-1', 'user-1'))
    await waitFor(() => {
      expect(result.current.status).toBe('empty')
    })

    await act(async () => {
      await expect(result.current.sendMessage('please fail')).rejects.toThrowError(
        'Failed to send message',
      )
    })

    expect(result.current.messages).toHaveLength(0)
    expect(result.current.error).toBe('Failed to send message')
  })

  it('treats whitespace-only content as a no-op (no API call, no state change)', async () => {
    mockedGetMessages.mockResolvedValue({ messages: [], nextCursor: null })

    const { result } = renderHook(() => useOptimisticMessages('conv-1', 'user-1'))
    await waitFor(() => {
      expect(result.current.status).toBe('empty')
    })

    await act(async () => {
      await result.current.sendMessage('   ')
    })

    expect(mockedSendMessage).not.toHaveBeenCalled()
    expect(result.current.messages).toHaveLength(0)
    expect(result.current.error).toBeNull()
  })

  it('clears messages and returns to idle when conversationId switches to null', async () => {
    mockedGetMessages.mockResolvedValue({
      messages: [buildMessage('msg-1', '2026-01-01T00:00:00.000Z')],
      nextCursor: null,
    })

    const { result, rerender } = renderHook(
      ({ id }: { id: string | null }) => useOptimisticMessages(id, 'user-1'),
      { initialProps: { id: 'conv-1' as string | null } },
    )
    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    rerender({ id: null })

    await waitFor(() => {
      expect(result.current.status).toBe('idle')
    })
    expect(result.current.messages).toHaveLength(0)
  })
})
