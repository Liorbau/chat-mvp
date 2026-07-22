import type { AssistantSseEvent } from '@chat/contract'
import { API_BASE_URL, buildHeaders, throwApiError } from '@/api/apiClient'
import { readSseStream } from '@/api/sse'

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

  if (!response.ok || response.body == null) {
    await throwApiError(response)
    return
  }

  await readSseStream<AssistantSseEvent>(response, onEvent)
}
