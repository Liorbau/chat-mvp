import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import {
  type BaseCheckpointSaver,
  type CompiledStateGraph,
  END,
  START,
  StateGraph,
} from '@langchain/langgraph'
import { AgentState, type AgentStateType } from './agent.state'
import { createAgentNodes } from './agent.nodes'
import type { AgentToolsService } from './tools/agent-tools.service'

type AgentGraphDeps = {
  chatModel: BaseChatModel
  tools: AgentToolsService
  checkpointer?: BaseCheckpointSaver
}

export function buildAgentGraph(
  deps: AgentGraphDeps,
): CompiledStateGraph<AgentStateType, Partial<AgentStateType>> {
  const { chatModel, tools, checkpointer } = deps
  const nodes = createAgentNodes(chatModel, tools)

  const workflow = new StateGraph(AgentState)
    .addNode('route', nodes.route)
    .addNode('retrieve', nodes.retrieve)
    .addNode('tool_call', nodes.toolCall)
    .addNode('tool_result', nodes.toolResult)
    .addEdge(START, 'route')
    .addConditionalEdges('route', nodes.decideNext, {
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
