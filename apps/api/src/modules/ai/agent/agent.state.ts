import type { BaseMessage } from '@langchain/core/messages'
import { Annotation, messagesStateReducer } from '@langchain/langgraph'
import type { Citation } from '@chat/contract'
import type { RetrievedChunk } from '../../knowledge/knowledge.retriever.service'

export type AgentConversationType = 'assistant' | 'tutor'

const replace = <T>(_prev: T, next: T): T => next

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({ reducer: messagesStateReducer, default: () => [] }),
  conversationType: Annotation<AgentConversationType>(),
  requesterId: Annotation<string>(),
  conversationId: Annotation<string>(),
  retrieved: Annotation<RetrievedChunk[]>({ reducer: replace, default: () => [] }),
  citations: Annotation<Citation[]>({ reducer: replace, default: () => [] }),
  // Handed from tool_call to tool_result, then folded into messages and cleared.
  pendingToolMessages: Annotation<BaseMessage[]>({ reducer: replace, default: () => [] }),
})

export type AgentStateType = typeof AgentState.State
