import type { BaseMessage } from '@langchain/core/messages'
import type { StreamEvent } from '@langchain/core/tracers/log_stream'
import type { AssistantSseEvent } from '@chat/contract'
import { SOURCES_SENTINEL } from '../citations'

const TOOL_LABELS: Record<string, string> = {
  retrieve_knowledge: 'Searching your documents…',
  summarize_my_recent_messages: 'Summarizing your recent chats…',
  get_my_name: 'Looking up your info…',
}

function labelFor(tool: string): string {
  return TOOL_LABELS[tool] ?? 'Working…'
}

// Translates the agent graph's event stream into SSE events: tool start/end, and
// answer-node tokens with the trailing "SOURCES:" line held back. Returns the full
// streamed text so the caller can tell whether the LLM produced anything.
export async function* streamToSse(
  events: AsyncIterable<StreamEvent>,
): AsyncGenerator<AssistantSseEvent, string> {
  let emitted = 0
  let full = ''
  let sourcesReached = false

  for await (const event of events) {
    if (event.event === 'on_tool_start') {
      yield { type: 'tool_call', tool: event.name, label: labelFor(event.name) }
    } else if (event.event === 'on_tool_end') {
      yield { type: 'tool_result', tool: event.name }
    } else if (
      event.event === 'on_chat_model_stream' &&
      event.metadata.langgraph_node === 'answer'
    ) {
      full += (event.data.chunk as BaseMessage).text
      if (sourcesReached) {
        continue
      }
      const markerAt = full.toUpperCase().indexOf(SOURCES_SENTINEL)
      if (markerAt !== -1) {
        if (markerAt > emitted) {
          yield { type: 'token', value: full.slice(emitted, markerAt) }
        }
        emitted = markerAt
        sourcesReached = true
        continue
      }
      // Hold back a tail that could be the start of the SOURCES marker.
      const safeEnd = full.length - (SOURCES_SENTINEL.length - 1)
      if (safeEnd > emitted) {
        yield { type: 'token', value: full.slice(emitted, safeEnd) }
        emitted = safeEnd
      }
    }
  }

  if (!sourcesReached && full.length > emitted) {
    yield { type: 'token', value: full.slice(emitted) }
  }
  return full
}
