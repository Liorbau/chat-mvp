import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { KnowledgeRetrieverService, TOP_K } from './knowledge.retriever.service'

function makeRetriever(): KnowledgeRetrieverService {
  const collection = { db: { client: { appendMetadata: vi.fn() } } }
  const chunkDb = { chunkCollection: () => collection }
  const configService = { getOrThrow: () => 'kb_chunks_vector' }
  return new KnowledgeRetrieverService(chunkDb as never, {} as never, configService as never)
}

describe('KnowledgeRetrieverService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("scopes the vector search to the caller's userId, so another user's chunks are never retrieved", async () => {
    const search = vi
      .spyOn(MongoDBAtlasVectorSearch.prototype, 'similaritySearchWithScore')
      .mockResolvedValue([])

    await makeRetriever().retrieve('u-alex', 'what is a closure?')

    expect(search).toHaveBeenCalledWith('what is a closure?', TOP_K, {
      preFilter: { userId: { $eq: 'u-alex' } },
    })
  })
})
