import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import type { ZodType } from 'zod'
import type {
  LlmProvider,
  LlmMessage,
  LlmRequest,
  LlmStopReason,
  LlmStreamEvent,
  LlmToolUse,
  StructuredRequest,
} from '../llm.provider'

const DEFAULT_MODEL = 'gpt-4o'
const DEFAULT_MAX_TOKENS = 2048

function toOpenAiMessages(request: {
  system: string
  messages: LlmMessage[]
}): OpenAI.Chat.ChatCompletionMessageParam[] {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: request.system },
  ]
  for (const message of request.messages) {
    if (message.role === 'user') {
      messages.push({ role: 'user', content: message.content })
    } else if (message.role === 'tool') {
      for (const result of message.results) {
        messages.push({ role: 'tool', tool_call_id: result.id, content: result.content })
      }
    } else if (message.toolUses !== undefined && message.toolUses.length > 0) {
      messages.push({
        role: 'assistant',
        content: message.content === '' ? null : message.content,
        tool_calls: message.toolUses.map((toolUse) => ({
          id: toolUse.id,
          type: 'function',
          function: { name: toolUse.name, arguments: JSON.stringify(toolUse.input) },
        })),
      })
    } else {
      messages.push({ role: 'assistant', content: message.content })
    }
  }
  return messages
}

function parseToolCall(toolCall: { id: string; name: string; args: string }): LlmToolUse {
  if (toolCall.args === '') {
    return { id: toolCall.id, name: toolCall.name, input: {} }
  }
  try {
    return {
      id: toolCall.id,
      name: toolCall.name,
      input: JSON.parse(toolCall.args) as Record<string, unknown>,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid JSON'
    return { id: toolCall.id, name: toolCall.name, input: {}, parseError: message }
  }
}

function toStopReason(reason: string | null | undefined): LlmStopReason {
  if (reason === 'tool_calls') {
    return 'tool_use'
  }
  if (reason === 'length') {
    return 'max_tokens'
  }
  return 'end_turn'
}

@Injectable()
export class OpenAiProvider implements LlmProvider {
  private client?: OpenAI
  private readonly model: string
  private readonly maxTokens: number

  constructor(private readonly configService: ConfigService) {
    this.model = configService.get<string>('LLM_MODEL') ?? DEFAULT_MODEL
    this.maxTokens = configService.get<number>('LLM_MAX_TOKENS') ?? DEFAULT_MAX_TOKENS
  }

  private getClient(): OpenAI {
    if (this.client === undefined) {
      this.client = new OpenAI({ apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY') })
    }
    return this.client
  }

  async *streamReply(request: LlmRequest): AsyncGenerator<LlmStreamEvent> {
    const tools: OpenAI.Chat.ChatCompletionTool[] = request.tools.map((tool) => ({
      type: 'function',
      function: { name: tool.name, description: tool.description, parameters: tool.inputSchema },
    }))

    const stream = await this.getClient().chat.completions.create({
      model: this.model,
      max_completion_tokens: this.maxTokens,
      messages: toOpenAiMessages(request),
      ...(tools.length > 0 ? { tools } : {}),
      stream: true,
    })

    let text = ''
    const toolCalls = new Map<number, { id: string; name: string; args: string }>()
    let finishReason: string | null = null

    for await (const chunk of stream) {
      const choice = chunk.choices[0]
      if (choice === undefined) {
        continue
      }
      const delta = choice.delta
      if (delta.content !== null && delta.content !== undefined && delta.content !== '') {
        text += delta.content
        yield { type: 'text', text: delta.content }
      }
      for (const toolCall of delta.tool_calls ?? []) {
        const current = toolCalls.get(toolCall.index) ?? { id: '', name: '', args: '' }
        if (toolCall.id !== undefined) {
          current.id = toolCall.id
        }
        if (toolCall.function?.name !== undefined) {
          current.name = toolCall.function.name
        }
        if (toolCall.function?.arguments !== undefined) {
          current.args += toolCall.function.arguments
        }
        toolCalls.set(toolCall.index, current)
      }
      if (choice.finish_reason !== null) {
        finishReason = choice.finish_reason
      }
    }

    const toolUses: LlmToolUse[] = [...toolCalls.values()].map((toolCall) =>
      parseToolCall(toolCall),
    )

    yield { type: 'done', stopReason: toStopReason(finishReason), toolUses, text }
  }

  async generateStructured<T>(request: StructuredRequest, schema: ZodType<T>): Promise<T> {
    const completion = await this.getClient().chat.completions.parse({
      model: this.model,
      max_completion_tokens: this.maxTokens,
      messages: toOpenAiMessages(request),
      response_format: zodResponseFormat(schema, 'result'),
    })
    const parsed = completion.choices[0]?.message.parsed
    if (parsed === null || parsed === undefined) {
      throw new Error('OpenAI structured output failed schema validation')
    }
    return parsed
  }
}
