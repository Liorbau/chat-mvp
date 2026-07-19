import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ConfigService } from '@nestjs/config'
import type { Message } from '@chat/contract'
import { generateStructured } from '../../src/modules/ai/chat-model'
import { SUMMARIZE_SYSTEM_PROMPT } from '../../src/modules/ai/prompts/summarize.prompt'
import { formatTranscript, OutputSchema } from '../../src/modules/ai/agent/tools/summarize.shared'
import { scoreSummary } from './scorer'

type Fixture = {
  id: string
  category: string
  messages: { from: 'me' | 'them'; content: string }[]
  good: string
  bad: string
}

export const name = 'summarize_my_recent_messages'

const ME = 'me'

function toMessages(fixture: Fixture): Message[] {
  return fixture.messages
    .map((message, index) => ({
      id: `${fixture.id}-${index}`,
      conversationId: fixture.id,
      senderId: message.from === 'me' ? ME : 'them',
      content: message.content,
      createdAt: new Date(0).toISOString(),
    }))
    .reverse()
}

export async function run(): Promise<number[]> {
  const configService = new ConfigService()
  const fixtures: Fixture[] = JSON.parse(
    readFileSync(
      join(process.cwd(), 'eval', 'summarize.recent.messages', 'fixtures.json'),
      'utf8',
    ),
  )

  const scores: number[] = []
  for (const fixture of fixtures) {
    const transcript = formatTranscript(toMessages(fixture), ME, 50)
    const result = await generateStructured(
      configService,
      SUMMARIZE_SYSTEM_PROMPT,
      transcript,
      OutputSchema,
    )
    const summary = result.summaries.map((entry) => entry.summary).join('\n')
    const { score, reasons } = await scoreSummary({
      configService,
      transcript,
      summary,
      good: fixture.good,
      bad: fixture.bad,
    })
    scores.push(score)
    console.log(`\n[${fixture.id}] ${fixture.category}`)
    console.log(`  summary: ${summary}`)
    console.log(`  score:   ${score.toFixed(2)} — ${reasons.join('; ')}`)
  }
  return scores
}
