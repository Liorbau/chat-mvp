import { ChatAnthropic } from '@langchain/anthropic'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'
import type { ConfigService } from '@nestjs/config'
import type { ZodType } from 'zod'

type ChatModelFactory = (configService: ConfigService) => BaseChatModel

const CHAT_MODEL_FACTORIES: Record<string, ChatModelFactory> = {
  openai: (config) =>
    new ChatOpenAI({
      apiKey: config.getOrThrow<string>('OPENAI_API_KEY'),
      model: config.get<string>('LLM_MODEL') ?? 'gpt-4o',
      temperature: 0,
    }),
  anthropic: (config) =>
    new ChatAnthropic({
      apiKey: config.getOrThrow<string>('ANTHROPIC_API_KEY'),
      model: config.get<string>('LLM_MODEL') ?? 'claude-opus-4-8',
      temperature: 0,
    }),
}

export function createChatModel(configService: ConfigService): BaseChatModel {
  const provider = configService.get<string>('LLM_PROVIDER') ?? 'openai'
  const factory = CHAT_MODEL_FACTORIES[provider]
  if (!factory) {
    const supported = Object.keys(CHAT_MODEL_FACTORIES).join(', ')
    throw new Error(`Unsupported LLM_PROVIDER "${provider}". Supported: ${supported}`)
  }
  return factory(configService)
}

// One-shot structured output via the chat model's native withStructuredOutput
// (fail-closed: throws if the model output doesn't match the schema).
export async function generateStructured<T extends Record<string, unknown>>(
  configService: ConfigService,
  system: string,
  userContent: string,
  schema: ZodType<T>,
): Promise<T> {
  const model = createChatModel(configService).withStructuredOutput<T>(schema)
  return model.invoke([new SystemMessage(system), new HumanMessage(userContent)])
}
