import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
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

const DEFAULT_MODEL = 'claude-opus-4-8'
const DEFAULT_MAX_TOKENS = 2048

function toAnthropicMessage(message: LlmMessage): Anthropic.MessageParam {
  if (message.role === 'user') {
    return { role: 'user', content: message.content }
  }
  if (message.role === 'tool') {
    return {
      role: 'user',
      content: message.results.map((result) => ({
        type: 'tool_result',
        tool_use_id: result.id,
        content: result.content,
        is_error: result.isError ?? false,
      })),
    }
  }
  if (message.toolUses !== undefined && message.toolUses.length > 0) {
    const blocks: Anthropic.ContentBlockParam[] = []
    if (message.content !== '') {
      blocks.push({ type: 'text', text: message.content })
    }
    for (const toolUse of message.toolUses) {
      blocks.push({ type: 'tool_use', id: toolUse.id, name: toolUse.name, input: toolUse.input })
    }
    return { role: 'assistant', content: blocks }
  }
  return { role: 'assistant', content: message.content }
}

function toStopReason(reason: string | null): LlmStopReason {
  if (reason === 'tool_use' || reason === 'max_tokens') {
    return reason
  }
  return 'end_turn'
}

@Injectable()
export class AnthropicProvider implements LlmProvider {
  private client?: Anthropic
  private readonly model: string
  private readonly maxTokens: number

  constructor(private readonly configService: ConfigService) {
    this.model = configService.get<string>('LLM_MODEL') ?? DEFAULT_MODEL
    this.maxTokens = configService.get<number>('LLM_MAX_TOKENS') ?? DEFAULT_MAX_TOKENS
  }

  private getClient(): Anthropic {
    if (this.client === undefined) {
      this.client = new Anthropic({
        apiKey: this.configService.getOrThrow<string>('ANTHROPIC_API_KEY'),
      })
    }
    return this.client
  }

  async *streamReply(request: LlmRequest): AsyncGenerator<LlmStreamEvent> {
    const stream = this.getClient().messages.stream({
      model: this.model,
      max_tokens: this.maxTokens,
      system: request.system,
      messages: request.messages.map(toAnthropicMessage),
      tools: request.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
      })),
    })

    let text = ''
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        text += event.delta.text
        yield { type: 'text', text: event.delta.text }
      }
    }

    const final = await stream.finalMessage()
    const toolUses: LlmToolUse[] = final.content
      .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
      .map((block) => ({
        id: block.id,
        name: block.name,
        input: block.input as Record<string, unknown>,
      }))

    yield { type: 'done', stopReason: toStopReason(final.stop_reason), toolUses, text }
  }

  async generateStructured<T>(request: StructuredRequest, schema: ZodType<T>): Promise<T> {
    const response = await this.getClient().messages.parse({
      model: this.model,
      max_tokens: this.maxTokens,
      system: request.system,
      messages: request.messages.map(toAnthropicMessage),
      output_config: { format: zodOutputFormat(schema) },
    })
    if (response.parsed_output === null) {
      throw new Error('Anthropic structured output failed schema validation')
    }
    return response.parsed_output
  }
}
