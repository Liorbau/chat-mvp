import { readFileSync } from 'node:fs'

const commitMessageFile = process.argv[2]

if (!commitMessageFile) {
  console.error('Missing commit message file path.')
  process.exit(1)
}

const rawMessage = readFileSync(commitMessageFile, 'utf8')
const message = rawMessage
  .split('\n')
  .find((line) => line.trim() !== '' && !line.startsWith('#'))
  ?.trim()

if (!message) {
  console.error('Commit message is empty.')
  process.exit(1)
}

if (message.length > 72) {
  console.error('Commit message must be 72 characters or fewer.')
  process.exit(1)
}

const formatPattern = /^[a-z0-9][a-z0-9./-]*: .+\.$/
if (!formatPattern.test(message)) {
  console.error('Commit message must match "<file/topic>: <message>." format.')
  process.exit(1)
}

const [, description] = message.split(': ', 2)
if (!description) {
  console.error('Commit message description is missing.')
  process.exit(1)
}

const firstWord = description.split(' ')[0]
if (firstWord !== firstWord.toLowerCase()) {
  console.error('Commit message description must start with a lowercase verb.')
  process.exit(1)
}
