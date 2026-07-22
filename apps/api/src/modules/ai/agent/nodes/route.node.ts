import { AIMessage, SystemMessage } from '@langchain/core/messages'
import type { RunnableConfig } from '@langchain/core/runnables'
import { parseAnswer, toCitations } from '../../citations'
import { ASSISTANT_SYSTEM_PROMPT } from '../../prompts/assistant.prompt'
import { NO_CONTEXT_REPLY, TUTOR_SYSTEM_PROMPT } from '../../prompts/tutor.prompt'
import { type AgentConversationType, type AgentStateType } from '../agent.state'
import type { AgentNodeContext } from './node-context'

function systemPromptFor(type: AgentConversationType): string {
  return type === 'tutor' ? TUTOR_SYSTEM_PROMPT : ASSISTANT_SYSTEM_PROMPT
}

function answerMessage(replaceId: string | undefined, content: string): AIMessage {
  return new AIMessage(replaceId ? { id: replaceId, content } : { content })
}

// route decides the turn: refuse (tutor with empty retrieval), request tools, or
// answer. It is the only node that invokes the model to generate the reply.
export async function routeNode(
  ctx: AgentNodeContext,
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
  const response = await ctx.modelWithTools.invoke(
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
