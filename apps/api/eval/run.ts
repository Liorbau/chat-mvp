import 'dotenv/config'
import * as summarize from './summarize.recent.messages/eval'

const THRESHOLD = 0.7
const suites = [summarize]

async function main(): Promise<void> {
  const scores: number[] = []
  for (const suite of suites) {
    console.log(`\n=== ${suite.name} ===`)
    scores.push(...(await suite.run()))
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
