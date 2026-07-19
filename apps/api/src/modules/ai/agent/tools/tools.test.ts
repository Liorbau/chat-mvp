import type { RunnableConfig } from '@langchain/core/runnables'
import { describe, expect, it, vi } from 'vitest'
import { buildGetMyNameTool } from './get-my-name.tool'
import { SummarizeService } from './summarize.service'

// generateStructured hits the LLM; stub it so we can assert the scoping logic.
vi.mock('../../chat-model', () => ({
  generateStructured: vi.fn().mockResolvedValue({
    summaries: [{ conversationId: 'c-user', summary: 'chat with Dana' }],
  }),
}))

const config: RunnableConfig = { configurable: { requesterId: 'u-alex' } }

describe('buildGetMyNameTool', () => {
  it('returns only the name, scoped to the JWT requester', async () => {
    const usersService = {
      findById: vi.fn().mockResolvedValue({
        id: 'u-alex',
        name: 'Alex',
        email: 'alex@example.com',
        passwordHash: 'secret-hash',
      }),
    }
    const result = await buildGetMyNameTool(usersService as never).invoke({}, config)

    expect(usersService.findById).toHaveBeenCalledWith('u-alex')
    expect(result).toContain('Alex')
    expect(result).not.toContain('secret-hash')
    expect(result).not.toContain('alex@example.com')
  })
})

describe('SummarizeService', () => {
  it('scopes reads to the JWT requesterId and skips assistant conversations', async () => {
    const conversationsService = {
      listConversations: vi.fn().mockResolvedValue([
        { id: 'c-user', type: 'user', participantIds: ['u-alex', 'u-dana'], title: 'Dana' },
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
    const tool = new SummarizeService(
      conversationsService as never,
      messagesDbService as never,
      usersService as never,
      {} as never,
    )

    const content = await tool.summarize({ limit: 5 }, 'u-alex')

    // Identity is the requesterId param, never anything from tool input.
    expect(conversationsService.listConversations).toHaveBeenCalledWith('u-alex')
    // Only the 'user' conversation is read; the assistant conversation is excluded.
    expect(messagesDbService.listRecentForConversations).toHaveBeenCalledWith(['c-user'], 5)
    expect(usersService.findByIds).toHaveBeenCalledWith(['u-dana'])
    const parsed = JSON.parse(content) as { summaries: Array<{ conversationId: string }> }
    expect(parsed.summaries[0]?.conversationId).toBe('c-user')
  })
})
