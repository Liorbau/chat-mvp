import { AIMessageChunk } from '@langchain/core/messages'
import type { StreamEvent } from '@langchain/core/tracers/log_stream'
import { describe, expect, it } from 'vitest'
import type { AssistantSseEvent } from '@chat/contract'
import { streamToSse } from './stream-to-sse'

function events(...items: unknown[]): AsyncGenerator<StreamEvent> {
  return (async function* generate() {
    for (const item of items) {
      yield item as StreamEvent
    }
  })()
}

function token(text: string, node = 'route'): unknown {
  return {
    event: 'on_chat_model_stream',
    name: 'model',
    data: { chunk: new AIMessageChunk(text) },
    metadata: { langgraph_node: node },
  }
}

async function collect(
  gen: AsyncGenerator<AssistantSseEvent, string>,
): Promise<{ emitted: AssistantSseEvent[]; returned: string }> {
  const emitted: AssistantSseEvent[] = []
  let result = await gen.next()
  while (result.done !== true) {
    emitted.push(result.value)
    result = await gen.next()
  }
  return { emitted, returned: result.value }
}

function tokenText(emitted: AssistantSseEvent[]): string {
  return emitted.map((event) => (event.type === 'token' ? event.value : '')).join('')
}

describe('streamToSse', () => {
  it('maps tool start/end to tool_call and tool_result', async () => {
    const { emitted } = await collect(
      streamToSse(
        events(
          { event: 'on_tool_start', name: 'retrieve_knowledge', data: {}, metadata: {} },
          { event: 'on_tool_end', name: 'retrieve_knowledge', data: {}, metadata: {} },
        ),
      ),
    )
    expect(emitted).toEqual([
      { type: 'tool_call', tool: 'retrieve_knowledge', label: 'Searching your documents…' },
      { type: 'tool_result', tool: 'retrieve_knowledge' },
    ])
  })

  it('streams route-node tokens and returns the full text', async () => {
    const { emitted, returned } = await collect(
      streamToSse(events(token('Hello '), token('world'))),
    )
    expect(tokenText(emitted)).toBe('Hello world')
    expect(returned).toBe('Hello world')
  })

  it('holds the SOURCES line back from the token stream', async () => {
    const { emitted } = await collect(
      streamToSse(events(token('The sky is blue and clear. '), token('SOURCES: 1'))),
    )
    expect(tokenText(emitted)).toBe('The sky is blue and clear. ')
    expect(tokenText(emitted)).not.toContain('SOURCES')
  })

  it('ignores tokens from non-route nodes', async () => {
    const { emitted } = await collect(streamToSse(events(token('deciding', 'retrieve'))))
    expect(emitted).toHaveLength(0)
  })
})
