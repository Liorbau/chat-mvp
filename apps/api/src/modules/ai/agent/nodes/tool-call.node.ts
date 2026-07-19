import type { RunnableConfig } from '@langchain/core/runnables'
import type { AgentStateType } from '../agent.state'
import type { AgentNodeContext } from './node-context'

export async function toolCallNode(
  ctx: AgentNodeContext,
  state: AgentStateType,
  config: RunnableConfig,
): Promise<Partial<AgentStateType>> {
  const { toolMessages } = await ctx.runTools(state, config)
  return { pendingToolMessages: toolMessages }
}
