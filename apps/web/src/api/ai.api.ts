import type { AssistantSseEvent } from '@chat/contract'
import { API_BASE_URL, buildHeaders, throwApiError } from './apiClient'

// Streams the agent reply over SSE, invoking onEvent for each parsed frame.
export async function streamAssistant(
  conversationId: string,
  content: string,
  onEvent: (event: AssistantSseEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ai/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify({ content }),
    signal,
  })

  if (!response.ok || response.body === null) {
    await throwApiError(response)
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary).trim()
      buffer = buffer.slice(boundary + 2)
      if (frame.startsWith('data:')) {
        const json = frame.slice(5).trim()
        if (json.length > 0) {
          onEvent(JSON.parse(json) as AssistantSseEvent)
        }
      }
      boundary = buffer.indexOf('\n\n')
    }
  }
}
