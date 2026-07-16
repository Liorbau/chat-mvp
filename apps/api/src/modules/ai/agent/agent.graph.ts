import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessage, isAIMessage, SystemMessage, type ToolMessage } from '@langchain/core/messages'
import type { RunnableConfig } from '@langchain/core/runnables'
import {
  type BaseCheckpointSaver,
  type CompiledStateGraph,
  END,
  START,
  StateGraph,
} from '@langchain/langgraph'
import type { RetrievedChunk } from '../../knowledge/knowledge.retriever.service'
import { parseAnswer, toCitations } from '../citations'
import { ASSISTANT_SYSTEM_PROMPT } from '../prompts/assistant.prompt'
import { NO_CONTEXT_REPLY, TUTOR_SYSTEM_PROMPT } from '../prompts/tutor.prompt'
import { AgentState, type AgentConversationType, type AgentStateType } from './agent.state'
import type { AgentToolsService } from './tools/agent-tools.service'

type AgentGraphDeps = {
  chatModel: BaseChatModel
  tools: AgentToolsService
  checkpointer?: BaseCheckpointSaver
}

type Route = 'retrieve' | 'tool_call' | 'end'

function systemPromptFor(type: AgentConversationType): string {
  return type === 'tutor' ? TUTOR_SYSTEM_PROMPT : ASSISTANT_SYSTEM_PROMPT
}

function pendingToolCalls(
  state: AgentStateType,
): { name: string; args: Record<string, unknown>; id?: string }[] {
  const last = state.messages.at(-1)
  return last !== undefined && isAIMessage(last) ? (last.tool_calls ?? []) : []
}

function answerMessage(replaceId: string | undefined, content: string): AIMessage {
  return new AIMessage(replaceId !== undefined ? { id: replaceId, content } : { content })
}

export function buildAgentGraph(
  deps: AgentGraphDeps,
): CompiledStateGraph<AgentStateType, Partial<AgentStateType>> {
  const { chatModel, tools, checkpointer } = deps
  if (typeof chatModel.bindTools !== 'function') {
    throw new Error('Configured chat model does not support tool calling')
  }
  const modelWithTools = chatModel.bindTools(tools.all())

  async function route(
    state: AgentStateType,
    config: RunnableConfig,
  ): Promise<Partial<AgentStateType>> {
    if (
      state.conversationType === 'tutor' &&
      state.retrievalAttempted &&
      state.retrieved.length === 0
    ) {
      return { messages: [answerMessage(undefined, NO_CONTEXT_REPLY)], citations: [] }
    }
    const system = systemPromptFor(state.conversationType)
    const response = await modelWithTools.invoke(
      [new SystemMessage(system), ...state.messages],
      config,
    )
    if ((response.tool_calls ?? []).length > 0) {
      return { messages: [response] }
    }
    const { answer: text, usedIndices } = parseAnswer(response.text)
    const citations =
      state.conversationType === 'tutor' ? toCitations(usedIndices, state.retrieved) : []
    return { messages: [answerMessage(response.id, text)], citations }
  }

  function decideNext(state: AgentStateType): Route {
    const calls = pendingToolCalls(state)
    if (calls.length === 0) {
      return 'end'
    }
    return calls.some((call) => tools.isRetrieval(call.name)) ? 'retrieve' : 'tool_call'
  }

  // Executes every tool call on the last message so none is left unanswered,
  // returning the tool messages plus any chunks retrieval produced.
  async function runTools(
    state: AgentStateType,
    config: RunnableConfig,
  ): Promise<{ toolMessages: ToolMessage[]; retrieved: RetrievedChunk[] }> {
    const toolMessages: ToolMessage[] = []
    const retrieved: RetrievedChunk[] = []
    for (const call of pendingToolCalls(state)) {
      const tool = tools.get(call.name)
      if (tool === undefined) {
        throw new Error(`Unknown tool: ${call.name}`)
      }
      const toolMessage = (await tool.invoke(call, config)) as ToolMessage
      toolMessages.push(toolMessage)
      if (tools.isRetrieval(call.name)) {
        retrieved.push(...((toolMessage.artifact as RetrievedChunk[] | undefined) ?? []))
      }
    }
    return { toolMessages, retrieved }
  }

  async function retrieve(
    state: AgentStateType,
    config: RunnableConfig,
  ): Promise<Partial<AgentStateType>> {
    const { toolMessages, retrieved } = await runTools(state, config)
    return { messages: toolMessages, retrieved, retrievalAttempted: true }
  }

  async function toolCall(
    state: AgentStateType,
    config: RunnableConfig,
  ): Promise<Partial<AgentStateType>> {
    const { toolMessages } = await runTools(state, config)
    return { pendingToolMessages: toolMessages }
  }

  function toolResult(state: AgentStateType): Partial<AgentStateType> {
    return { messages: state.pendingToolMessages, pendingToolMessages: [] }
  }

  const workflow = new StateGraph(AgentState)
    .addNode('route', route)
    .addNode('retrieve', retrieve)
    .addNode('tool_call', toolCall)
    .addNode('tool_result', toolResult)
    .addEdge(START, 'route')
    .addConditionalEdges('route', decideNext, {
      retrieve: 'retrieve',
      tool_call: 'tool_call',
      end: END,
    })
    .addEdge('retrieve', 'route')
    .addEdge('tool_call', 'tool_result')
    .addEdge('tool_result', 'route')

  // Widen LangGraph's node-name-literal generics to the state-only form the service uses.
  return workflow.compile(checkpointer ? { checkpointer } : {}) as unknown as CompiledStateGraph<
    AgentStateType,
    Partial<AgentStateType>
  >
}
