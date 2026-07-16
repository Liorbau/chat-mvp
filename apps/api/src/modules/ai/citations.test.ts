import { describe, expect, it } from 'vitest'
import type { RetrievedChunk } from '../knowledge/knowledge.retriever.service'
import { parseAnswer, toCitations } from './citations'

function chunk(n: number): RetrievedChunk {
  return {
    chunkId: `chunk-${n}`,
    documentId: `doc-${n}`,
    documentName: `Doc ${n}`,
    text: `text ${n}`,
    score: 0.9,
  }
}

describe('parseAnswer', () => {
  it('splits the answer from the SOURCES line and parses indices', () => {
    expect(parseAnswer('The sky is blue.\nSOURCES: 1, 3')).toEqual({
      answer: 'The sky is blue.',
      usedIndices: [1, 3],
    })
  })

  it('returns no indices when there is no SOURCES marker', () => {
    expect(parseAnswer('Just an answer.')).toEqual({ answer: 'Just an answer.', usedIndices: [] })
  })

  it('treats "SOURCES: none" as no citations', () => {
    expect(parseAnswer("I don't know.\nSOURCES: none")).toEqual({
      answer: "I don't know.",
      usedIndices: [],
    })
  })

  it('ignores non-numeric entries in the sources list', () => {
    expect(parseAnswer('Answer.\nSOURCES: 2, x, 4').usedIndices).toEqual([2, 4])
  })
})

describe('toCitations', () => {
  it('maps 1-based indices to their chunks', () => {
    const citations = toCitations([1, 3], [chunk(1), chunk(2), chunk(3)])
    expect(citations.map((citation) => citation.chunkId)).toEqual(['chunk-1', 'chunk-3'])
  })

  it('drops indices outside the retrieved chunks', () => {
    expect(toCitations([2, 9], [chunk(1), chunk(2)])).toHaveLength(1)
  })

  it('returns an empty list when no indices were used', () => {
    expect(toCitations([], [chunk(1)])).toEqual([])
  })
})
