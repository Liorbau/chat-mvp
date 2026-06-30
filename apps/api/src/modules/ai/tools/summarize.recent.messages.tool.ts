import { Inject, Injectable } from '@nestjs/common'
import { ConversationsService } from '../../conversations/conversations.service'
import { MessagesDbService } from '../../messages/messages.dbService'
import { UsersService } from '../../users/users.service'
import {
  LLM_PROVIDER,
  type LlmProvider,
  type LlmToolDef,
  type LlmToolResult,
  type LlmToolUse,
} from '../llm.provider'
import { SUMMARIZE_SYSTEM_PROMPT } from '../prompts/summarize.prompt'
import type { AiTool } from './ai.tool'
import { InputSchema, OutputSchema, formatTranscript, toToolInputSchema } from './summarize.shared'

@Injectable()
export class SummarizeRecentMessagesTool implements AiTool {
  readonly definition: LlmToolDef = {
    name: 'summarize_my_recent_messages',
    description:
      "Summarize the user's recent conversations with other people, returning one short summary per conversation.",
    inputSchema: toToolInputSchema(),
  }

  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesDbService: MessagesDbService,
    private readonly usersService: UsersService,
    @Inject(LLM_PROVIDER) private readonly llmProvider: LlmProvider,
  ) {}

  // All reads are scoped to the JWT requesterId, never to model-supplied input.
  async execute(toolUse: LlmToolUse, requesterId: string): Promise<LlmToolResult> {
    const parsed = InputSchema.safeParse(toolUse.input)
    if (!parsed.success) {
      return {
        id: toolUse.id,
        content: `Invalid tool input: ${parsed.error.message}`,
        isError: true,
      }
    }
    const limit = parsed.data.limit

    const conversations = (await this.conversationsService.listConversations(requesterId)).filter(
      (conversation) => conversation.type === 'user',
    )
    if (conversations.length === 0) {
      return { id: toolUse.id, content: 'You have no conversations with other people yet.' }
    }

    const ids = conversations.map((conversation) => conversation.id)
    const recent = await this.messagesDbService.listRecentForConversations(ids, limit)
    if (recent.length === 0) {
      return { id: toolUse.id, content: 'Your conversations have no messages to summarize yet.' }
    }

    const otherIdByConversation = new Map(
      conversations.map(
        (conversation) =>
          [conversation.id, conversation.participantIds.find((id) => id !== requesterId)] as const,
      ),
    )
    const otherIds = [...otherIdByConversation.values()].filter(
      (id): id is string => id !== undefined,
    )
    const nameById = new Map(
      (await this.usersService.findByIds(otherIds)).map((u) => [u.id, u.name]),
    )
    const otherNameByConversation = new Map(
      [...otherIdByConversation].map(([conversationId, otherId]) => {
        return [conversationId, (otherId && nameById.get(otherId)) || 'name unknown'] as const
      }),
    )
    const prompt = formatTranscript(recent, requesterId, limit, otherNameByConversation)

    try {
      const result = await this.llmProvider.generateStructured(
        { system: SUMMARIZE_SYSTEM_PROMPT, messages: [{ role: 'user', content: prompt }] },
        OutputSchema,
      )
      const titleById = new Map(conversations.map((c) => [c.id, c.title ?? 'Untitled']))
      const summaries = result.summaries.map((entry) => ({
        conversationId: entry.conversationId,
        title: titleById.get(entry.conversationId) ?? 'Untitled',
        summary: entry.summary,
      }))
      return { id: toolUse.id, content: JSON.stringify({ summaries }) }
    } catch {
      return { id: toolUse.id, content: 'Failed to produce a valid summary.', isError: true }
    }
  }
}
