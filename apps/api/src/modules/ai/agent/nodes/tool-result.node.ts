import type { AgentStateType } from '../agent.state'

export function toolResultNode(state: AgentStateType): Partial<AgentStateType> {
  return { messages: state.pendingToolMessages, pendingToolMessages: [] }
}
