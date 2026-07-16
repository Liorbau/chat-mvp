import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import type { AssistantSseEvent, Citation } from '@chat/contract'

// Drives the real API end-to-end: upload docs, ask each question, read recall
// straight from the tutor's citations. Requires `npm run dev:api` running.
const API = process.env.EVAL_API_BASE_URL ?? 'http://localhost:4000'
// Voyage's card-free tier is 3 RPM; space every embedding-triggering call.
const THROTTLE_MS = 21_000
const INDEX_LAG_MS = 25_000

type Fixture = {
  id: string
  question: string
  expectedDocument: string | null
  expectedKeywords: string[]
}

type TurnResult = { answer: string; citations: Citation[] }

const DIR = join(process.cwd(), 'src', 'modules', 'ai', 'eval', 'rag')

async function signup(): Promise<string> {
  const email = `eval_${String(process.pid)}_${String(Math.floor(Date.now() / 1000))}@example.com`
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123', firstName: 'Eval', lastName: 'Run' }),
  })
  if (!res.ok) {
    throw new Error(`signup failed (${String(res.status)})`)
  }
  const body = (await res.json()) as { token: string }
  return body.token
}

// Returns the document's chunk count (the "relevant chunks" total for recall).
async function uploadDoc(token: string, name: string, content: string): Promise<number> {
  const form = new FormData()
  form.append('file', new Blob([content], { type: 'text/markdown' }), name)
  const res = await fetch(`${API}/knowledge/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!res.ok) {
    throw new Error(`upload ${name} failed (${String(res.status)})`)
  }
  const body = (await res.json()) as { chunkCount: number }
  return body.chunkCount
}

async function createTutorConversation(token: string): Promise<string> {
  const res = await fetch(`${API}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ type: 'tutor' }),
  })
  const body = (await res.json()) as { id: string }
  return body.id
}

async function askTutor(
  token: string,
  conversationId: string,
  content: string,
): Promise<TurnResult> {
  const res = await fetch(`${API}/ai/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  })
  if (res.body === null) {
    throw new Error('no SSE body')
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let answer = ''
  let citations: Citation[] = []
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary).trim()
      buffer = buffer.slice(boundary + 2)
      if (frame.startsWith('data:')) {
        const event = JSON.parse(frame.slice(5).trim()) as AssistantSseEvent
        if (event.type === 'token') {
          answer += event.value
        } else if (event.type === 'done') {
          citations = event.citations ?? []
        }
      }
      boundary = buffer.indexOf('\n\n')
    }
  }
  return { answer, citations }
}

// A grounded refusal — whether via the empty-retrieval short-circuit or the
// LLM declining because the retrieved context doesn't answer the question.
const REFUSAL = /don't have|couldn't find|not in your notes|no information|don't know/i

function isRefusal(answer: string): boolean {
  return REFUSAL.test(answer)
}

// Fraction of expected keywords present in the answer (0..1).
function keywordScore(answer: string, keywords: string[]): number {
  if (keywords.length === 0) {
    return 1
  }
  const lower = answer.toLowerCase()
  const matched = keywords.filter((keyword) => lower.includes(keyword.toLowerCase())).length
  return matched / keywords.length
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

async function main(): Promise<void> {
  const fixtures: Fixture[] = JSON.parse(readFileSync(join(DIR, 'fixtures.json'), 'utf8'))
  const docFiles = readdirSync(join(DIR, 'docs'))

  console.log(`Signing up eval user and uploading ${String(docFiles.length)} documents…`)
  const token = await signup()
  const chunkCounts = new Map<string, number>()
  for (const name of docFiles) {
    const count = await uploadDoc(token, name, readFileSync(join(DIR, 'docs', name), 'utf8'))
    chunkCounts.set(name, count)
    console.log(`  uploaded ${name} (${String(count)} chunks)`)
    await sleep(THROTTLE_MS)
  }

  console.log(`Waiting ${String(INDEX_LAG_MS / 1000)}s for the Atlas vector index to catch up…`)
  await sleep(INDEX_LAG_MS)
  const conversationId = await createTutorConversation(token)

  const precisions: number[] = []
  const recalls: number[] = []
  const hits: number[] = []
  const answerScores: number[] = []
  const refusals: number[] = []

  for (const fixture of fixtures) {
    const { answer, citations } = await askTutor(token, conversationId, fixture.question)
    const citedDocs = citations.map((citation) => citation.documentName)

    if (fixture.expectedDocument === null) {
      const refused = isRefusal(answer) ? 1 : 0
      refusals.push(refused)
      console.log(`\n[${fixture.id}] (out-of-KB) refused=${refused === 1 ? 'yes' : 'no'}`)
      console.log(`  answer: ${answer}`)
    } else {
      const relevantRetrieved = citations.filter(
        (citation) => citation.documentName === fixture.expectedDocument,
      ).length
      const totalRelevant = chunkCounts.get(fixture.expectedDocument) ?? 1
      const precision = citations.length === 0 ? 0 : relevantRetrieved / citations.length
      const recall = relevantRetrieved / totalRelevant
      const hit = relevantRetrieved > 0 ? 1 : 0
      const answerScore = keywordScore(answer, fixture.expectedKeywords)
      precisions.push(precision)
      recalls.push(recall)
      hits.push(hit)
      answerScores.push(answerScore)
      console.log(
        `\n[${fixture.id}] hit=${hit === 1 ? 'Y' : 'N'} p=${round(precision).toFixed(2)} r=${round(recall).toFixed(2)} answer=${round(answerScore).toFixed(2)}`,
      )
      console.log(`  cited: ${citedDocs.join(', ') || '(none)'}`)
      console.log(`  answer: ${answer}`)
    }
    await sleep(THROTTLE_MS)
  }

  const retrievalScore = round(average(hits))
  const answerScore = round(average(answerScores))
  const summary = {
    questions: fixtures.length,
    precisionAt4: round(average(precisions)),
    recallAt4: round(average(recalls)),
    hitRateAt4: retrievalScore,
    retrievalScore,
    answerScore,
    refusalAccuracy: round(average(refusals)),
    overall: round((retrievalScore + answerScore) / 2),
  }
  console.log('\n=== RAG eval summary (temperature 0) ===')
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
