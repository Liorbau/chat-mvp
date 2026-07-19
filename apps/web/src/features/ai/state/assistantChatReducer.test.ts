import { describe, expect, it } from 'vitest'
import { assistantChatReducer, initialAssistantState } from './assistantChatReducer'

describe('assistantChatReducer', () => {
  it('sets the tool label on TOOL_CALL', () => {
    const next = assistantChatReducer(initialAssistantState, {
      type: 'TOOL_CALL',
      payload: { label: 'Searching your documents…' },
    })
    expect(next.toolLabel).toBe('Searching your documents…')
  })

  it('resets the tool label at the start of a new turn', () => {
    const stale = { ...initialAssistantState, toolLabel: 'old label' }
    const next = assistantChatReducer(stale, {
      type: 'SEND_START',
      payload: {
        optimistic: {
          id: 'temp-1',
          conversationId: 'c-1',
          senderId: 'u-1',
          content: 'hi',
          createdAt: 'now',
        },
      },
    })
    expect(next.toolLabel).toBeNull()
  })

  it('clears the tool label when the answer completes', () => {
    const streaming = { ...initialAssistantState, toolLabel: 'Searching…', streamingText: 'answer' }
    const done = assistantChatReducer(streaming, {
      type: 'DONE',
      payload: { messageId: 'm-1', senderId: 'assistant', createdAt: 'now' },
    })
    expect(done.toolLabel).toBeNull()
    expect(done.messages.at(-1)?.content).toBe('answer')
  })

  it('accumulates streaming tokens', () => {
    const first = assistantChatReducer(
      { ...initialAssistantState, streamingText: '' },
      { type: 'TOKEN', payload: { value: 'Hel' } },
    )
    const second = assistantChatReducer(first, { type: 'TOKEN', payload: { value: 'lo' } })
    expect(second.streamingText).toBe('Hello')
  })
})
