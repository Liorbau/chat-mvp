import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ConfigService } from '@nestjs/config'
import type { LlmProvider } from '../llm.provider'
import { AnthropicProvider } from '../providers/anthropic.provider'
import { OpenAiProvider } from '../providers/openai.provider'
import * as summarize from './summarize.recent.messages/eval'

const THRESHOLD = 0.7
const suites = [summarize]

// Minimal .env loader + ConfigService shim so we can build a provider without
// bootstrapping Nest/Mongoose (tsx can't emit the decorator metadata schemas need).
function loadEnv(): void {
  const file = readFileSync(join(process.cwd(), '.env'), 'utf8')
  for (const line of file.split('\n')) {
    const eq = line.indexOf('=')
    if (eq > 0 && !line.startsWith('#')) {
      const key = line.slice(0, eq).trim()
      const value = line.slice(eq + 1).trim()
      if (key && process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  }
}

const configShim = {
  get: (key: string): string | undefined => process.env[key],
  getOrThrow: (key: string): string => {
    const value = process.env[key]
    if (value === undefined) {
      throw new Error(`Missing env ${key}`)
    }
    return value
  },
} as unknown as ConfigService

function buildProvider(): LlmProvider {
  return process.env.LLM_PROVIDER === 'anthropic'
    ? new AnthropicProvider(configShim)
    : new OpenAiProvider(configShim)
}

async function main(): Promise<void> {
  loadEnv()
  const provider = buildProvider()

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
