// A grounded refusal — whether via the empty-retrieval short-circuit or the
// LLM declining because the retrieved context doesn't answer the question.
const REFUSAL = /don't have|couldn't find|not in your notes|no information|don't know/i

export function isRefusal(answer: string): boolean {
  return REFUSAL.test(answer)
}

// Fraction of expected keywords present in the answer (0..1).
export function keywordScore(answer: string, keywords: string[]): number {
  if (keywords.length === 0) {
    return 1
  }
  const lower = answer.toLowerCase()
  const matched = keywords.filter((keyword) => lower.includes(keyword.toLowerCase())).length
  return matched / keywords.length
}

export function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length
}

export function round(value: number): number {
  return Math.round(value * 1000) / 1000
}
