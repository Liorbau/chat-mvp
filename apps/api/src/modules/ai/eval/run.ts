import 'dotenv/config'
import { ConfigService } from '@nestjs/config'
import type { LlmProvider } from '../llm.provider'
import { AnthropicProvider } from '../providers/anthropic.provider'
import { OpenAiProvider } from '../providers/openai.provider'
import * as summarize from './summarize.recent.messages/eval'

const THRESHOLD = 0.7
const suites = [summarize]

// Same provider-selection logic as ai.module, built with a real ConfigService
// (no Nest bootstrap needed — `dotenv/config` loads .env into process.env).
function buildProvider(configService: ConfigService): LlmProvider {
  return configService.get<string>('LLM_PROVIDER') === 'anthropic'
    ? new AnthropicProvider(configService)
    : new OpenAiProvider(configService)
}

async function main(): Promise<void> {
  const provider = buildProvider(new ConfigService())

  const scores: number[] = []
  for (const suite of suites) {
    console.log(`\n=== ${suite.name} ===`)
    scores.push(...(await suite.run(provider)))
  }

  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length
  console.log(
    `\navgScore: ${avg.toFixed(3)} (threshold ${THRESHOLD}) -> ${avg >= THRESHOLD ? 'PASS' : 'FAIL'}`,
  )
  process.exit(avg >= THRESHOLD ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
