import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { askTutor, createTutorConversation, signup, uploadDoc } from './rag-eval.client'
import { average, isRefusal, keywordScore, round } from './rag-eval.scoring'

// Voyage's card-free tier is 3 RPM; space every embedding-triggering call.
const THROTTLE_MS = 21_000
const INDEX_LAG_MS = 25_000

const DIR = join(process.cwd(), 'src', 'modules', 'ai', 'eval', 'rag')

type Fixture = {
  id: string
  question: string
  expectedDocument: string | null
  expectedKeywords: string[]
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
