import type { Citation } from '@chat/contract'
import type { RetrievedChunk } from '../knowledge/knowledge.retriever.service'

export const SOURCES_SENTINEL = 'SOURCES:'

// Splits the raw model output into the displayed answer and the 1-based excerpt
// numbers it declared using.
export function parseAnswer(full: string): { answer: string; usedIndices: number[] } {
  const markerAt = full.toUpperCase().indexOf(SOURCES_SENTINEL)
  if (markerAt === -1) {
    return { answer: full.trim(), usedIndices: [] }
  }
  const answer = full.slice(0, markerAt).trim()
  const spec = full.slice(markerAt + SOURCES_SENTINEL.length).trim()
  if (spec.toLowerCase().startsWith('none')) {
    return { answer, usedIndices: [] }
  }
  const usedIndices = spec
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((n) => Number.isInteger(n))
  return { answer, usedIndices }
}

export function toCitations(usedIndices: number[], chunks: RetrievedChunk[]): Citation[] {
  return usedIndices
    .map((n) => chunks[n - 1])
    .filter((chunk): chunk is RetrievedChunk => Boolean(chunk))
    .map((chunk) => ({
      chunkId: chunk.chunkId,
      documentId: chunk.documentId,
      documentName: chunk.documentName,
      text: chunk.text,
      score: chunk.score,
    }))
}
