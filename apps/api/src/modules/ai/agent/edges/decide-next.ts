import type { AgentStateType } from '../agent.state'
import { pendingToolCalls, type AgentNodeContext } from '../nodes/node-context'

export type Route = 'retrieve' | 'tool_call' | 'end'

export function decideNext(ctx: AgentNodeContext, state: AgentStateType): Route {
  const calls = pendingToolCalls(state)
  if (calls.length === 0) {
    return 'end'
  }
  return calls.some((call) => ctx.tools.isRetrieval(call.name)) ? 'retrieve' : 'tool_call'
}
