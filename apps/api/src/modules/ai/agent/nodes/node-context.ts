import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { isAIMessage, type ToolMessage } from '@langchain/core/messages'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { RetrievedChunk } from '../../../knowledge/knowledge.retriever.service'
import type { AgentStateType } from '../agent.state'
import type { AgentToolsService } from '../tools/agent-tools.service'

export function pendingToolCalls(
  state: AgentStateType,
): { name: string; args: Record<string, unknown>; id?: string }[] {
  const last = state.messages.at(-1)
  return last && isAIMessage(last) ? (last.tool_calls ?? []) : []
}

// Shared context every node closes over: the tool-bound chat model, the tool
// registry, and the runner that executes pending tool calls.
export function createAgentNodeContext(chatModel: BaseChatModel, tools: AgentToolsService) {
  if (typeof chatModel.bindTools !== 'function') {
    throw new Error('Configured chat model does not support tool calling')
  }
  const modelWithTools = chatModel.bindTools(tools.all())

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
      if (!tool) {
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

  return { modelWithTools, tools, runTools }
}

export type AgentNodeContext = ReturnType<typeof createAgentNodeContext>
