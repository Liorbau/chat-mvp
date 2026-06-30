import { describe, expect, it } from 'vitest'
import { type ChatMessage, type Role, truncateIfNeeded } from './conversation.memory.service'

// 3 chars per token: a 30-char content is ~10 tokens.
const msg = (role: Role, content: string): ChatMessage => ({ role, content })
const text = (chars: number): string => 'x'.repeat(chars)

describe('truncateIfNeeded', () => {
  it('returns everything unchanged when under budget', () => {
    const messages = [msg('user', text(40)), msg('assistant', text(40))]
    expect(truncateIfNeeded(messages, 1000)).toEqual(messages)
  })

  it('drops oldest turns first until under budget', () => {
    const messages = [msg('user', text(30)), msg('user', text(30)), msg('user', text(30))]
    // 30 tokens total, budget 25 -> drop the oldest, leaving the last two.
    expect(truncateIfNeeded(messages, 25)).toEqual([messages[1], messages[2]])
  })

  it('never drops system messages', () => {
    const messages = [
      msg('system', text(30)),
      msg('user', text(30)),
      msg('user', text(30)),
      msg('user', text(30)),
    ]
    // 40 tokens, budget 25 -> drop oldest users, keep system + last user.
    const result = truncateIfNeeded(messages, 25)
    expect(result).toEqual([messages[0], messages[3]])
    expect(result.some((m) => m.role === 'system')).toBe(true)
  })

  it('keeps the final message even when it alone exceeds budget', () => {
    const messages = [msg('user', text(40)), msg('user', text(400))]
    const result = truncateIfNeeded(messages, 10)
    expect(result).toEqual([messages[1]])
  })

  it('keeps system + final message when nothing else is droppable', () => {
    const messages = [msg('system', text(40)), msg('user', text(400))]
    expect(truncateIfNeeded(messages, 10)).toEqual(messages)
  })
})
