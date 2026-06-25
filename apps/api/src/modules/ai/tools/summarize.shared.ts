import type { Message } from '@chat/contract'
import { z } from 'zod'

// Pure, Mongoose-free helpers shared by the tool and the eval harness.

export const InputSchema = z.object({
  limit: z.number().int().min(1).max(50).default(15),
})

export const OutputSchema = z.object({
  summaries: z.array(z.object({ conversationId: z.string(), summary: z.string() })),
})

export function toToolInputSchema(): Record<string, unknown> {
  const schema = z.toJSONSchema(InputSchema) as Record<string, unknown>
  delete schema.$schema
  return schema
}

export function formatTranscript(
  recentMostRecentFirst: Message[],
  requesterId: string,
  limit: number,
  otherNameByConversation: Map<string, string> = new Map(),
): string {
  const perConversation = new Map<string, Message[]>()
  for (const message of recentMostRecentFirst) {
    const kept = perConversation.get(message.conversationId) ?? []
    if (kept.length < limit) {
      kept.push(message)
    }
    perConversation.set(message.conversationId, kept)
  }

  const blocks: string[] = []
  for (const [conversationId, messages] of perConversation) {
    const other = otherNameByConversation.get(conversationId) ?? 'name unknown'
    const lines = [...messages]
      .reverse()
      .map((message) => `${message.senderId === requesterId ? 'You' : 'Them'}: ${message.content}`)
    blocks.push(`Conversation ${conversationId} (with ${other}):\n${lines.join('\n')}`)
  }
  return blocks.join('\n\n')
}
