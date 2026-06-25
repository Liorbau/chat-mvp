import type { ZodType } from 'zod'

export type LlmToolDef = {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export type LlmToolUse = {
  id: string
  name: string
  input: Record<string, unknown>
  parseError?: string
}
export type LlmToolResult = { id: string; content: string; isError?: boolean }

export type LlmMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string }
  | { role: 'assistant'; toolUses: LlmToolUse[] }
  | { role: 'tool'; results: LlmToolResult[] }

export type LlmRequest = {
  system: string
  messages: LlmMessage[]
  tools: LlmToolDef[]
}

// A one-shot, non-streaming request for structured output (no tools).
export type StructuredRequest = {
  system: string
  messages: LlmMessage[]
}

export type LlmStopReason = 'end_turn' | 'tool_use' | 'max_tokens'

export type LlmStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'done'; stopReason: LlmStopReason; toolUses: LlmToolUse[]; text: string }

export abstract class LlmProvider {
  abstract streamReply(request: LlmRequest): AsyncIterable<LlmStreamEvent>

  abstract generateStructured<T>(request: StructuredRequest, schema: ZodType<T>): Promise<T>
}
