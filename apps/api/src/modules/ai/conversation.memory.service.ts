import { Injectable } from '@nestjs/common'
import { ASSISTANT_SENDER_ID } from '@chat/contract'
import { MessagesDbService } from '../messages/messages.dbService'

export type Role = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  role: Role
  content: string
}

export function estimateTokens(messages: ChatMessage[]): number {
  const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0)
  return Math.ceil(totalChars / 3)
}

export function truncateIfNeeded(messages: ChatMessage[], maxTokensBudget: number): ChatMessage[] {
  const window = [...messages]
  while (window.length > 1 && estimateTokens(window) > maxTokensBudget) {
    const dropIndex = window.findIndex(
      (msg, index) => msg.role !== 'system' && index !== window.length - 1,
    )
    if (dropIndex === -1) {
      break // only system messages and the final message remain
    }
    window.splice(dropIndex, 1)
  }
  return window
}

type LoadHistoryOptions = {
  assistantSenderId?: string
  systemPrompt?: string
}

const MAX_HISTORY_MESSAGES = 200

@Injectable()
export class ConversationMemoryService {
  constructor(private readonly messagesDbService: MessagesDbService) {}

  async loadHistoryForConversation(
    conversationId: string,
    maxTokensBudget: number,
    options: LoadHistoryOptions = {},
  ): Promise<ChatMessage[]> {
    const stored = await this.messagesDbService.listRecent(conversationId, MAX_HISTORY_MESSAGES)
    const history: ChatMessage[] = stored.map((message) => ({
      role: message.senderId === options.assistantSenderId ? 'assistant' : 'user',
      content: message.content,
    }))
    const withSystem = options.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt }, ...history]
      : history
    return truncateIfNeeded(withSystem, maxTokensBudget)
  }

  // Warm thread: only the newest message (checkpoint holds the rest). Cold: full history.
  async historyForTurn(
    conversationId: string,
    maxTokensBudget: number,
    isWarm: boolean,
  ): Promise<ChatMessage[]> {
    const history = await this.loadHistoryForConversation(conversationId, maxTokensBudget, {
      assistantSenderId: ASSISTANT_SENDER_ID,
    })
    if (!isWarm) {
      return history
    }
    const latest = history.at(-1)
    return latest ? [latest] : []
  }
}
