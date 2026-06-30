import { describe, expect, it, vi } from 'vitest'
import type { LlmToolUse } from '../llm.provider'
import { GetMyNameTool } from './get.my.name.tool'
import { SummarizeRecentMessagesTool } from './summarize.recent.messages.tool'

function toolUse(input: Record<string, unknown> = {}): LlmToolUse {
  return { id: 't1', name: 'tool', input }
}

describe('GetMyNameTool', () => {
  it('returns only the name, never id/email/hash', async () => {
    const usersService = {
      findById: vi.fn().mockResolvedValue({
        id: 'u-alex',
        name: 'Alex',
        email: 'alex@example.com',
        passwordHash: 'secret-hash',
      }),
    }
    const tool = new GetMyNameTool(usersService as never)

    const result = await tool.execute(toolUse(), 'u-alex')

    // Identity comes from the JWT requesterId, not from model input.
    expect(usersService.findById).toHaveBeenCalledWith('u-alex')
    expect(JSON.parse(result.content)).toEqual({ name: 'Alex' })
    expect(result.content).not.toContain('secret-hash')
    expect(result.content).not.toContain('alex@example.com')
  })
})

describe('SummarizeRecentMessagesTool', () => {
  it('scopes reads to the JWT requesterId and skips assistant conversations', async () => {
    const conversationsService = {
      listConversations: vi.fn().mockResolvedValue([
        { id: 'c-user', type: 'user', participantIds: ['u-alex', 'u-dana'] },
        { id: 'c-assistant', type: 'assistant', participantIds: ['u-alex'] },
      ]),
    }
    const messagesDbService = {
      listRecentForConversations: vi
        .fn()
        .mockResolvedValue([
          { id: 'm1', conversationId: 'c-user', senderId: 'u-dana', content: 'hi' },
        ]),
    }
    const usersService = {
      findByIds: vi.fn().mockResolvedValue([{ id: 'u-dana', name: 'Dana' }]),
    }
    const llmProvider = {
      generateStructured: vi.fn().mockResolvedValue({
        summaries: [{ conversationId: 'c-user', summary: 'chat with Dana' }],
      }),
    }
    const tool = new SummarizeRecentMessagesTool(
      conversationsService as never,
      messagesDbService as never,
      usersService as never,
      llmProvider as never,
    )

    const result = await tool.execute(toolUse({ limit: 5 }), 'u-alex')

    // Identity is the requesterId param, never anything from tool input.
    expect(conversationsService.listConversations).toHaveBeenCalledWith('u-alex')
    // Only the 'user' conversation is read; the assistant conversation is excluded.
    expect(messagesDbService.listRecentForConversations).toHaveBeenCalledWith(['c-user'], 5)
    // Names are resolved only for the other participant, not the whole table.
    expect(usersService.findByIds).toHaveBeenCalledWith(['u-dana'])
    const parsed = JSON.parse(result.content) as { summaries: Array<{ conversationId: string }> }
    expect(parsed.summaries).toHaveLength(1)
    expect(parsed.summaries[0]?.conversationId).toBe('c-user')
  })
})
