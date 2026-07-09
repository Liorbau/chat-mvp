import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOpenAI } from '@langchain/openai'
import type { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import { createChatModel } from './chat-model'

function config(values: Record<string, string>): ConfigService {
  return {
    get: (key: string) => values[key],
    getOrThrow: (key: string) => {
      const value = values[key]
      if (value === undefined) {
        throw new Error(`missing ${key}`)
      }
      return value
    },
  } as unknown as ConfigService
}

describe('createChatModel', () => {
  it('defaults to OpenAI', () => {
    expect(createChatModel(config({ OPENAI_API_KEY: 'sk-test' }))).toBeInstanceOf(ChatOpenAI)
  })

  it('selects Anthropic when LLM_PROVIDER=anthropic', () => {
    const model = createChatModel(
      config({ LLM_PROVIDER: 'anthropic', ANTHROPIC_API_KEY: 'sk-ant' }),
    )
    expect(model).toBeInstanceOf(ChatAnthropic)
  })

  it('throws on an unknown provider instead of silently defaulting', () => {
    expect(() => createChatModel(config({ LLM_PROVIDER: 'bedrock' }))).toThrow(/Unsupported/)
  })
})
