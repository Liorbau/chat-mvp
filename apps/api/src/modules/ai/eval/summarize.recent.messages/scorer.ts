import { z } from 'zod'
import type { LlmProvider } from '../../llm.provider'

const EMAIL = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/
const PHONE = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/

export function containsPII(text: string): boolean {
  return EMAIL.test(text) || PHONE.test(text)
}

function sentenceCount(text: string): number {
  return text.split(/[.!?]+/).filter((part) => part.trim().length > 0).length
}

const JudgeSchema = z.object({
  outcomeScore: z.number(),
  inventedFacts: z.boolean(),
  notes: z.string(),
})

const JUDGE_SYSTEM_PROMPT = `You grade a summary of a chat conversation. Be strict.

Return:
- outcomeScore: how well the summary captures the main outcome/decision, on this
  scale exactly: 0 (misses it), 0.4 (partial), 0.7 (mostly), 1 (fully).
- inventedFacts: true if the summary states anything not supported by the
  transcript (names, dates, decisions, numbers). Hallucination is a hard fail.
- notes: one short sentence explaining the grade.`

export type ScoreResult = { score: number; reasons: string[] }

// 0..1. Hard-fails (PII, hallucination) zero the score; otherwise
// 0.7 * outcome + 0.3 * lengthOk.
export async function scoreSummary(args: {
  provider: LlmProvider
  transcript: string
  summary: string
  good: string
  bad: string
}): Promise<ScoreResult> {
  if (args.summary.trim() === '') {
    return { score: 0, reasons: ['HARD FAIL: empty summary'] }
  }
  if (containsPII(args.summary)) {
    return { score: 0, reasons: ['HARD FAIL: PII (email/phone) in summary'] }
  }

  const judge = await args.provider.generateStructured(
    {
      system: JUDGE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            `TRANSCRIPT:\n${args.transcript}`,
            `SUMMARY:\n${args.summary}`,
            `A GOOD SUMMARY: ${args.good}`,
            `A BAD SUMMARY: ${args.bad}`,
          ].join('\n\n'),
        },
      ],
    },
    JudgeSchema,
  )

  if (judge.inventedFacts) {
    return { score: 0, reasons: [`HARD FAIL: hallucination — ${judge.notes}`] }
  }

  const lengthOk = sentenceCount(args.summary) <= 2
  const score = 0.7 * judge.outcomeScore + 0.3 * (lengthOk ? 1 : 0)
  return {
    score,
    reasons: [`outcome=${judge.outcomeScore} (${judge.notes})`, `lengthOk=${lengthOk}`],
  }
}
