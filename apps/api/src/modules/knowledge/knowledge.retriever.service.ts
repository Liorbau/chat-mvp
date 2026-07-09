import type { Document } from '@langchain/core/documents'
import { Embeddings } from '@langchain/core/embeddings'
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { KnowledgeDbService } from './knowledge.dbService'

export const TOP_K = 4

type VectorStoreCollection = ConstructorParameters<typeof MongoDBAtlasVectorSearch>[1]['collection']

export type RetrievedChunk = {
  chunkId: string
  documentId: string
  documentName: string
  text: string
  score: number
}

function metadataString(metadata: Record<string, unknown>, key: string): string {
  const value = metadata[key]
  if (typeof value !== 'string') {
    throw new Error(`Retrieved chunk is missing string field "${key}"`)
  }
  return value
}

function toRetrievedChunk([doc, score]: [Document, number]): RetrievedChunk {
  const metadata = doc.metadata as Record<string, unknown>
  return {
    chunkId: metadataString(metadata, '_id'),
    documentId: metadataString(metadata, 'documentId'),
    documentName: metadataString(metadata, 'documentName'),
    text: doc.pageContent,
    score,
  }
}

@Injectable()
export class KnowledgeRetrieverService {
  private store?: MongoDBAtlasVectorSearch

  constructor(
    private readonly knowledgeDb: KnowledgeDbService,
    private readonly embeddings: Embeddings,
    private readonly configService: ConfigService,
  ) {}

  // Built lazily: the vector store needs the native driver collection, which
  // only exists once Mongo has connected (after module init).
  private vectorStore(): MongoDBAtlasVectorSearch {
    if (this.store === undefined) {
      this.store = new MongoDBAtlasVectorSearch(this.embeddings, {
        collection: this.knowledgeDb.chunkCollection() as unknown as VectorStoreCollection,
        indexName: this.configService.getOrThrow<string>('VECTOR_INDEX_NAME'),
        textKey: 'text',
        embeddingKey: 'embedding',
      })
    }
    return this.store
  }

  // The userId pre-filter scopes results to the caller — no cross-user retrieval.
  async retrieve(userId: string, query: string): Promise<RetrievedChunk[]> {
    const results = await this.vectorStore().similaritySearchWithScore(query, TOP_K, {
      preFilter: { userId: { $eq: userId } },
    })
    return results.map(toRetrievedChunk)
  }
}
