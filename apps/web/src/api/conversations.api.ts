import type { Conversation } from '@chat/contract'
import { request } from './apiClient'
import type { CreateConversationInput } from './types'

export async function getConversations(): Promise<Conversation[]> {
  return request<Conversation[]>('/conversations')
}

export async function createConversation(input: CreateConversationInput): Promise<Conversation> {
  return request<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
