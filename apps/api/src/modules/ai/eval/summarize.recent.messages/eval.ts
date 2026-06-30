import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Message } from '@chat/contract'
import type { LlmProvider } from '../../llm.provider'
import { SUMMARIZE_SYSTEM_PROMPT } from '../../prompts/summarize.prompt'
import { formatTranscript, OutputSchema } from '../../tools/summarize.shared'
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

export async function run(provider: LlmProvider): Promise<number[]> {
  const fixtures: Fixture[] = JSON.parse(
    readFileSync(
      join(
        process.cwd(),
        'src',
        'modules',
        'ai',
        'eval',
        'summarize.recent.messages',
        'fixtures.json',
      ),
      'utf8',
    ),
  )

  const scores: number[] = []
  for (const fixture of fixtures) {
    const transcript = formatTranscript(toMessages(fixture), ME, 50)
    const result = await provider.generateStructured(
      { system: SUMMARIZE_SYSTEM_PROMPT, messages: [{ role: 'user', content: transcript }] },
      OutputSchema,
    )
    const summary = result.summaries.map((entry) => entry.summary).join('\n')
    const { score, reasons } = await scoreSummary({
      provider,
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
