import type { RunnableConfig } from '@langchain/core/runnables'
import type { AgentStateType } from '../agent.state'
import type { AgentNodeContext } from './node-context'

export async function retrieveNode(
  ctx: AgentNodeContext,
  state: AgentStateType,
  config: RunnableConfig,
): Promise<Partial<AgentStateType>> {
  const { toolMessages, retrieved } = await ctx.runTools(state, config)
  return { messages: toolMessages, retrieved, retrievalAttempted: true }
}
