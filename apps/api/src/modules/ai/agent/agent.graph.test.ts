import { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'
import { MemorySaver } from '@langchain/langgraph'
import { describe, expect, it, vi } from 'vitest'
import type { RetrievedChunk } from '../../knowledge/knowledge.retriever.service'
import { NO_CONTEXT_REPLY } from '../prompts/tutor.prompt'
import { buildAgentGraph } from './agent.graph'
import type { AgentConversationType, AgentStateType } from './agent.state'

const CHUNK: RetrievedChunk = {
  chunkId: 'chunk-1',
  documentId: 'doc-1',
  documentName: 'Notes',
  text: 'The sky is blue.',
  score: 0.9,
}

const retrievalCall = new AIMessage({
  content: '',
  tool_calls: [
    { id: 'tc1', name: 'retrieve_knowledge', args: { query: 'sky' }, type: 'tool_call' },
  ],
})
// Fake chat model: the single tool-bound generation node consumes these responses
// in order — a tool-call response routes to a tool, a plain response is the answer.
function fakeModel(routeResponses: AIMessage[]) {
  const boundInvoke = vi.fn()
  for (const response of routeResponses) {
    boundInvoke.mockResolvedValueOnce(response)
  }
  return { bindTools: () => ({ invoke: boundInvoke }), invoke: vi.fn() }
}

function fakeTools(artifact: RetrievedChunk[]) {
  return {
    all: () => [],
    isRetrieval: (name: string) => name === 'retrieve_knowledge',
    get: () => ({
      invoke: (call: { id: string }) =>
        Promise.resolve(new ToolMessage({ content: 'context', tool_call_id: call.id, artifact })),
    }),
  }
}

async function invokeGraph(
  chatModel: ReturnType<typeof fakeModel>,
  tools: ReturnType<typeof fakeTools>,
  conversationType: AgentConversationType,
): Promise<AgentStateType> {
  const graph = buildAgentGraph({ chatModel: chatModel as never, tools: tools as never })
  const state = await graph.invoke(
    {
      messages: [new HumanMessage('why is the sky blue?')],
      conversationType,
      requesterId: 'u1',
      conversationId: 'c1',
    },
    { configurable: { thread_id: 'c1', requesterId: 'u1' } },
  )
  return state as AgentStateType
}

describe('agent graph routing', () => {
  it('tutor: routes through retrieval and cites the used chunk', async () => {
    const model = fakeModel([retrievalCall, new AIMessage('It scatters blue light.\nSOURCES: 1')])
    const state = await invokeGraph(model, fakeTools([CHUNK]), 'tutor')

    expect(state.messages.at(-1)?.text).toBe('It scatters blue light.')
    expect(state.citations).toHaveLength(1)
    expect(state.citations[0]?.chunkId).toBe('chunk-1')
  })

  it('tutor: refuses without hallucinating when retrieval is empty', async () => {
    // Only one bound call is queued: the refusal short-circuits before a second
    // model call, proving retrieval ran and produced nothing.
    const model = fakeModel([retrievalCall])
    const state = await invokeGraph(model, fakeTools([]), 'tutor')

    expect(state.messages.at(-1)?.text).toBe(NO_CONTEXT_REPLY)
    expect(state.citations).toEqual([])
  })

  it('assistant: answers directly when no tool is needed, with no citations', async () => {
    const model = fakeModel([new AIMessage('Hello there!')])
    const state = await invokeGraph(model, fakeTools([]), 'assistant')

    expect(state.messages.at(-1)?.text).toBe('Hello there!')
    expect(state.citations).toEqual([])
  })
})

describe('agent graph checkpointing', () => {
  it('remembers earlier turns from the checkpointer on the same thread', async () => {
    const model = fakeModel([new AIMessage(''), new AIMessage('')])
    const graph = buildAgentGraph({
      chatModel: model as never,
      tools: fakeTools([]) as never,
      checkpointer: new MemorySaver(),
    })
    const config = { configurable: { thread_id: 'thread-1', requesterId: 'u1' } }

    await graph.invoke(
      {
        messages: [new HumanMessage('first')],
        conversationType: 'assistant',
        requesterId: 'u1',
        conversationId: 'c1',
      },
      config,
    )
    const second = (await graph.invoke(
      {
        messages: [new HumanMessage('second')],
        conversationType: 'assistant',
        requesterId: 'u1',
        conversationId: 'c1',
      },
      config,
    )) as AgentStateType

    // The second turn's state still holds the first turn — proof state resumed.
    const texts = second.messages.map((message) => message.text)
    expect(texts).toContain('first')
    expect(texts).toContain('second')
  })
})
