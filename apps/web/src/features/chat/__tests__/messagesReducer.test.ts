import { describe, expect, it } from 'vitest'
import type { Message } from '../api/chatApi.types'
import { initialMessagesState, messagesReducer, type MessagesState } from '../state/messagesReducer'

function buildMessage(id: string, createdAt: string, content: string = 'hi'): Message {
  return {
    id,
    conversationId: 'conv-1',
    senderId: 'user-1',
    content,
    createdAt,
  }
}

describe('messagesReducer', () => {
  it('LOAD_SUCCESS replaces messages and clears error', () => {
    const previousState: MessagesState = {
      messages: [],
      pendingMessages: [],
      error: 'previous error',
    }

    const nextState = messagesReducer(previousState, {
      type: 'LOAD_SUCCESS',
      payload: {
        messages: [buildMessage('msg-1', '2026-01-01T00:01:00.000Z')],
      },
    })

    expect(nextState.messages).toHaveLength(1)
    expect(nextState.messages[0]?.id).toBe('msg-1')
    expect(nextState.error).toBeNull()
  })

  it('LOAD_SUCCESS preserves pendingMessages so an in-flight send survives a reload', () => {
    const inFlightMessage = buildMessage('temp-1', '2026-01-01T00:00:00.000Z', 'sending...')
    const previousState: MessagesState = {
      messages: [],
      pendingMessages: [inFlightMessage],
      error: null,
    }

    const nextState = messagesReducer(previousState, {
      type: 'LOAD_SUCCESS',
      payload: {
        messages: [buildMessage('msg-1', '2026-01-01T00:01:00.000Z')],
      },
    })

    expect(nextState.messages.map((message) => message.id)).toEqual(['msg-1'])
    expect(nextState.pendingMessages).toEqual([inFlightMessage])
  })

  it('RESET returns the initial state (used when switching conversations)', () => {
    const populatedState: MessagesState = {
      messages: [buildMessage('msg-1', '2026-01-01T00:01:00.000Z')],
      pendingMessages: [buildMessage('temp-1', '2026-01-01T00:00:00.000Z')],
      error: 'stale error',
    }

    const nextState = messagesReducer(populatedState, { type: 'RESET' })

    expect(nextState).toEqual(initialMessagesState)
    expect(nextState.messages).toHaveLength(0)
    expect(nextState.pendingMessages).toHaveLength(0)
    expect(nextState.error).toBeNull()
  })

  it('SEND_START appends an optimistic message to pendingMessages', () => {
    const temporaryMessage = buildMessage('temp-1', '2026-01-01T00:05:00.000Z', 'hello')

    const nextState = messagesReducer(initialMessagesState, {
      type: 'SEND_START',
      payload: { message: temporaryMessage },
    })

    expect(nextState.pendingMessages).toEqual([temporaryMessage])
    expect(nextState.error).toBeNull()
  })

  it('SEND_SUCCESS replaces the temp message with the real one and sorts messages', () => {
    const temporaryMessage = buildMessage('temp-1', '2026-01-01T00:05:00.000Z', 'hello')
    const olderMessage = buildMessage('msg-existing', '2026-01-01T00:00:00.000Z', 'older')
    const realMessage = buildMessage('msg-real', '2026-01-01T00:05:01.000Z', 'hello')

    const stateAfterStart: MessagesState = {
      messages: [olderMessage],
      pendingMessages: [temporaryMessage],
      error: null,
    }

    const nextState = messagesReducer(stateAfterStart, {
      type: 'SEND_SUCCESS',
      payload: { tempId: temporaryMessage.id, message: realMessage },
    })

    expect(nextState.pendingMessages).toHaveLength(0)
    expect(nextState.messages.map((message) => message.id)).toEqual(['msg-existing', 'msg-real'])
    expect(nextState.error).toBeNull()
  })

  it('SEND_FAILURE removes the temp message and sets a user-facing error', () => {
    const temporaryMessage = buildMessage('temp-1', '2026-01-01T00:05:00.000Z', 'hello')
    const stateAfterStart: MessagesState = {
      messages: [],
      pendingMessages: [temporaryMessage],
      error: null,
    }

    const nextState = messagesReducer(stateAfterStart, {
      type: 'SEND_FAILURE',
      payload: { tempId: temporaryMessage.id, error: 'Failed to send message' },
    })

    expect(nextState.pendingMessages).toHaveLength(0)
    expect(nextState.error).toBe('Failed to send message')
  })

  it('SEND_SUCCESS with unknown tempId still adds the real message without crashing (edge case)', () => {
    const realMessage = buildMessage('msg-real', '2026-01-01T00:05:00.000Z', 'hello')
    const stateAfterStart: MessagesState = {
      messages: [],
      pendingMessages: [buildMessage('temp-other', '2026-01-01T00:00:00.000Z')],
      error: null,
    }

    const nextState = messagesReducer(stateAfterStart, {
      type: 'SEND_SUCCESS',
      payload: { tempId: 'temp-not-in-state', message: realMessage },
    })

    expect(nextState.messages.map((message) => message.id)).toEqual(['msg-real'])
    expect(nextState.pendingMessages.map((message) => message.id)).toEqual(['temp-other'])
  })

  it('SEND_FAILURE with unknown tempId still records the error without crashing (edge case)', () => {
    const stateAfterStart: MessagesState = {
      messages: [],
      pendingMessages: [buildMessage('temp-existing', '2026-01-01T00:00:00.000Z')],
      error: null,
    }

    const nextState = messagesReducer(stateAfterStart, {
      type: 'SEND_FAILURE',
      payload: { tempId: 'temp-not-in-state', error: 'Failed to send message' },
    })

    expect(nextState.pendingMessages.map((message) => message.id)).toEqual(['temp-existing'])
    expect(nextState.error).toBe('Failed to send message')
  })
})
