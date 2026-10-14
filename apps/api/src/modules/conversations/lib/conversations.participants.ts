import type { CreateConversationInput } from '../conversations.service'

export function participantIdsFor(input: CreateConversationInput, creatorId: string): string[] {
  return [...new Set([...(input.participantIds ?? []), creatorId])]
}
