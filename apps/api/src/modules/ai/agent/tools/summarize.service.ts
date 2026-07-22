import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ConversationsService } from '../../../conversations/conversations.service'
import { MessagesDbService } from '../../../messages/messages.dbService'
import { UsersService } from '../../../users/users.service'
import { generateStructured } from '../../chat-model'
import { SUMMARIZE_SYSTEM_PROMPT } from '../../prompts/summarize.prompt'
import { OutputSchema, formatTranscript } from './summarize.shared'

@Injectable()
export class SummarizeService {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesDbService: MessagesDbService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  // All reads are scoped to the JWT requesterId, never to model-supplied input.
  async summarize(input: { limit: number }, requesterId: string): Promise<string> {
    const conversations = (await this.conversationsService.listConversations(requesterId)).filter(
      (conversation) => conversation.type === 'user',
    )
    if (conversations.length === 0) {
      return 'You have no conversations with other people yet.'
    }

    const ids = conversations.map((conversation) => conversation.id)
    const recent = await this.messagesDbService.listRecentForConversations(ids, input.limit)
    if (recent.length === 0) {
      return 'Your conversations have no messages to summarize yet.'
    }

    const otherIdByConversation = new Map(
      conversations.map(
        (conversation) =>
          [conversation.id, conversation.participantIds.find((id) => id !== requesterId)] as const,
      ),
    )
    const otherIds = [...otherIdByConversation.values()].filter((id): id is string => Boolean(id))
    const nameById = new Map(
      (await this.usersService.findByIds(otherIds)).map((user) => [user.id, user.name]),
    )
    const otherNameByConversation = new Map(
      [...otherIdByConversation].map(([conversationId, otherId]) => {
        return [conversationId, (otherId && nameById.get(otherId)) || 'name unknown'] as const
      }),
    )
    const prompt = formatTranscript(recent, requesterId, input.limit, otherNameByConversation)

    try {
      const result = await generateStructured(
        this.configService,
        SUMMARIZE_SYSTEM_PROMPT,
        prompt,
        OutputSchema,
      )
      const titleById = new Map(conversations.map((c) => [c.id, c.title ?? 'Untitled']))
      const summaries = result.summaries.map((entry) => ({
        conversationId: entry.conversationId,
        title: titleById.get(entry.conversationId) ?? 'Untitled',
        summary: entry.summary,
      }))
      return JSON.stringify({ summaries })
    } catch {
      return 'Failed to produce a valid summary.'
    }
  }
}
