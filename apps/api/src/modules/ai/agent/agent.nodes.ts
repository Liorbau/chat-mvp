import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { AgentStateType } from './agent.state'
import type { AgentToolsService } from './tools/agent-tools.service'
import { decideNext, type Route } from './edges/decide-next'
import { createAgentNodeContext } from './nodes/node-context'
import { retrieveNode } from './nodes/retrieve.node'
import { routeNode } from './nodes/route.node'
import { toolCallNode } from './nodes/tool-call.node'
import { toolResultNode } from './nodes/tool-result.node'

export type AgentNodes = {
  route: (state: AgentStateType, config: RunnableConfig) => Promise<Partial<AgentStateType>>
  decideNext: (state: AgentStateType) => Route
  retrieve: (state: AgentStateType, config: RunnableConfig) => Promise<Partial<AgentStateType>>
  toolCall: (state: AgentStateType, config: RunnableConfig) => Promise<Partial<AgentStateType>>
  toolResult: (state: AgentStateType) => Partial<AgentStateType>
}

// Binds each node/edge to a shared context so the graph can wire them by name.
export function createAgentNodes(chatModel: BaseChatModel, tools: AgentToolsService): AgentNodes {
  const ctx = createAgentNodeContext(chatModel, tools)
  return {
    route: (state, config) => routeNode(ctx, state, config),
    decideNext: (state) => decideNext(ctx, state),
    retrieve: (state, config) => retrieveNode(ctx, state, config),
    toolCall: (state, config) => toolCallNode(ctx, state, config),
    toolResult: toolResultNode,
  }
}
