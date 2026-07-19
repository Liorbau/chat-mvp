import type { GetMessagesResponse, SendMessageRequest, SendMessageResponse } from '@chat/contract'
import { request } from './apiClient'

export async function getMessages(
  conversationId: string,
  cursor?: string,
): Promise<GetMessagesResponse> {
  const query = cursor === undefined ? '' : `?cursor=${encodeURIComponent(cursor)}`
  return request<GetMessagesResponse>(`/conversations/${conversationId}/messages${query}`)
}

export async function sendMessage(request_: SendMessageRequest): Promise<SendMessageResponse> {
  return request<SendMessageResponse>(`/conversations/${request_.conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content: request_.content }),
  })
}
