import { type BaseMessage, AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ASSISTANT_SENDER_ID, type AssistantSseEvent, type Citation } from '@chat/contract'
import type { RetrievedChunk } from '../knowledge/knowledge.retriever.service'
import { KnowledgeRetrieverService } from '../knowledge/knowledge.retriever.service'
import { MessagesService } from '../messages/messages.service'
import { type ChatMessage, ConversationMemoryService } from './conversation.memory.service'
import { NO_CONTEXT_REPLY, TUTOR_SYSTEM_PROMPT } from './prompts/tutor.prompt'

const HISTORY_TOKEN_BUDGET = 12000
const SIMILARITY_THRESHOLD = 0.7
const RETRIEVAL_QUERY_TURNS = 3
// The model ends its reply with this marker + the excerpt numbers it used, so we
// cite only what the answer actually relied on (and nothing on a refusal).
const SOURCES_SENTINEL = 'SOURCES:'

type TurnInput = { conversationId: string; requesterId: string }

// Splits the raw model output into the displayed answer and the 1-based excerpt
// numbers it declared using.
function parseAnswer(full: string): { answer: string; usedIndices: number[] } {
  const markerAt = full.toUpperCase().indexOf(SOURCES_SENTINEL)
  if (markerAt === -1) {
    return { answer: full.trim(), usedIndices: [] }
  }
  const answer = full.slice(0, markerAt).trim()
  const spec = full.slice(markerAt + SOURCES_SENTINEL.length).trim()
  if (spec.toLowerCase().startsWith('none')) {
    return { answer, usedIndices: [] }
  }
  const usedIndices = spec
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((n) => Number.isInteger(n))
  return { answer, usedIndices }
}

// Concat recent user turns so a follow-up's antecedent ("its") is in the query.
function buildRetrievalQuery(history: ChatMessage[]): string {
  return history
    .filter((message) => message.role === 'user')
    .slice(-RETRIEVAL_QUERY_TURNS)
    .map((message) => message.content)
    .join('\n')
}

function buildPromptMessages(history: ChatMessage[], chunks: RetrievedChunk[]): BaseMessage[] {
  const context = chunks
    .map((chunk, index) => `[${index + 1}] (${chunk.documentName})\n${chunk.text}`)
    .join('\n\n')
  return [new SystemMessage(TUTOR_SYSTEM_PROMPT + context), ...history.map(toLangChainMessage)]
}

function toCitation(chunk: RetrievedChunk): Citation {
  return {
    chunkId: chunk.chunkId,
    documentId: chunk.documentId,
    documentName: chunk.documentName,
    text: chunk.text,
    score: chunk.score,
  }
}

function toLangChainMessage(message: ChatMessage): BaseMessage {
  return message.role === 'assistant'
    ? new AIMessage(message.content)
    : new HumanMessage(message.content)
}

function chunkToText(content: BaseMessage['content']): string {
  if (typeof content === 'string') {
    return content
  }
  return content
    .map((part) => ('text' in part && typeof part.text === 'string' ? part.text : ''))
    .join('')
}

@Injectable()
export class TutorService {
  private readonly logger = new Logger(TutorService.name)
  private readonly chatModel: ChatOpenAI

  constructor(
    private readonly memory: ConversationMemoryService,
    private readonly messagesService: MessagesService,
    private readonly retriever: KnowledgeRetrieverService,
    configService: ConfigService,
  ) {
    this.chatModel = new ChatOpenAI({
      apiKey: configService.getOrThrow<string>('OPENAI_API_KEY'),
      model: configService.get<string>('LLM_MODEL') ?? 'gpt-4o',
      temperature: 0,
    })
  }

  async *streamTutorReply(input: TurnInput): AsyncGenerator<AssistantSseEvent> {
    try {
      const history = await this.loadHistory(input.conversationId)
      yield { type: 'status', state: 'thinking' }

      const relevant = await this.retrieveRelevant(input.requesterId, history)
      if (relevant.length === 0) {
        yield* this.refuse(input.conversationId)
        return
      }

      const { answer, usedIndices } = parseAnswer(
        yield* this.streamAnswer(buildPromptMessages(history, relevant)),
      )
      if (answer === '') {
        yield { type: 'error', code: 'EMPTY_REPLY', message: 'The tutor returned no response.' }
        return
      }

      // Cite only the excerpts the model reported using (none on a refusal).
      const citations = usedIndices
        .map((n) => relevant[n - 1])
        .filter((chunk): chunk is RetrievedChunk => chunk !== undefined)
        .map(toCitation)
      const message = await this.messagesService.appendAssistantMessage(
        input.conversationId,
        answer,
        citations.length > 0 ? citations : undefined,
      )
      yield citations.length > 0
        ? { type: 'done', messageId: message.id, citations }
        : { type: 'done', messageId: message.id }
    } catch (error) {
      this.logger.error(`Tutor turn failed for conversation ${input.conversationId}`, error)
      yield { type: 'error', code: 'AI_ERROR', message: 'The tutor failed to respond.' }
    }
  }

  private async loadHistory(conversationId: string): Promise<ChatMessage[]> {
    return this.memory.loadHistoryForConversation(conversationId, HISTORY_TOKEN_BUDGET, {
      assistantSenderId: ASSISTANT_SENDER_ID,
    })
  }

  private async retrieveRelevant(
    userId: string,
    history: ChatMessage[],
  ): Promise<RetrievedChunk[]> {
    const retrieved = await this.retriever.retrieve(userId, buildRetrievalQuery(history))
    return retrieved.filter((chunk) => chunk.score >= SIMILARITY_THRESHOLD)
  }

  private async *refuse(conversationId: string): AsyncGenerator<AssistantSseEvent> {
    const message = await this.messagesService.appendAssistantMessage(
      conversationId,
      NO_CONTEXT_REPLY,
    )
    yield { type: 'token', value: NO_CONTEXT_REPLY }
    yield { type: 'done', messageId: message.id }
  }

  // Streams answer tokens to the client but stops forwarding once the SOURCES
  // marker begins, so that machine-only line never renders. Returns the full raw
  // text (answer + marker) for parsing.
  private async *streamAnswer(messages: BaseMessage[]): AsyncGenerator<AssistantSseEvent, string> {
    let full = ''
    let yielded = 0
    let stopped = false
    const stream = await this.chatModel.stream(messages)
    for await (const chunk of stream) {
      full += chunkToText(chunk.content)
      if (stopped) {
        continue
      }
      const markerAt = full.toUpperCase().indexOf(SOURCES_SENTINEL)
      if (markerAt !== -1) {
        if (markerAt > yielded) {
          yield { type: 'token', value: full.slice(yielded, markerAt) }
        }
        yielded = markerAt
        stopped = true
        continue
      }
      // Hold back a tail that could be the start of the marker.
      const safeEnd = full.length - (SOURCES_SENTINEL.length - 1)
      if (safeEnd > yielded) {
        yield { type: 'token', value: full.slice(yielded, safeEnd) }
        yielded = safeEnd
      }
    }
    if (!stopped && full.length > yielded) {
      yield { type: 'token', value: full.slice(yielded) }
    }
    return full
  }
}
