import { Embeddings } from '@langchain/core/embeddings'
import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import type { KnowledgeDocument } from '@chat/contract'
import type { Model } from 'mongoose'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Chunk, type ChunkDocument } from '../modules/knowledge/chunk.schema'
import {
  KnowledgeDocument as KnowledgeDocumentModel,
  type MongooseKnowledgeDocument,
} from '../modules/knowledge/document.schema'
import { createTestApp, login } from './test.app'

// Deterministic, offline stand-in for VoyageEmbeddings so ingestion runs without
// network. (Made possible by injecting the Embeddings abstraction, not the vendor.)
class FakeEmbeddings extends Embeddings {
  constructor() {
    super({})
  }
  embedDocuments(texts: string[]): Promise<number[][]> {
    return Promise.resolve(texts.map(() => Array<number>(1024).fill(0)))
  }
  embedQuery(): Promise<number[]> {
    return Promise.resolve(Array<number>(1024).fill(0))
  }
}

// NOTE: vector-retrieval isolation ($vectorSearch preFilter) needs Atlas and is
// covered by the eval; here we lock the invariants that run on local Mongo.
describe('Knowledge API', () => {
  let app: INestApplication

  beforeEach(async () => {
    app = await createTestApp('chat-test-knowledge', (builder) =>
      builder.overrideProvider(Embeddings).useValue(new FakeEmbeddings()),
    )
    // kb collections aren't seeded/reset by createTestApp, so clear them per test.
    await app
      .get<Model<MongooseKnowledgeDocument>>(getModelToken(KnowledgeDocumentModel.name))
      .deleteMany({})
    await app.get<Model<ChunkDocument>>(getModelToken(Chunk.name)).deleteMany({})
  })

  afterEach(async () => {
    await app.close()
  })

  function upload(token: string, filename: string, content: string): request.Test {
    return request(app.getHttpServer())
      .post('/knowledge/documents')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(content), { filename, contentType: 'text/markdown' })
  }

  function listDocuments(token: string): request.Test {
    return request(app.getHttpServer())
      .get('/knowledge/documents')
      .set('Authorization', `Bearer ${token}`)
  }

  it('returns 401 without a token', async () => {
    const response = await request(app.getHttpServer()).get('/knowledge/documents')
    expect(response.status).toBe(401)
  })

  it('re-uploading the same file does not duplicate the document or its chunks', async () => {
    const token = await login(app, 'alex@example.com')
    const content = '# Notes\n\nPhotosynthesis needs carbon dioxide, water, and light.'

    const first = await upload(token, 'notes.md', content)
    expect(first.status).toBe(201)
    const firstDoc = first.body as KnowledgeDocument
    expect(firstDoc.status).toBe('ready')

    const second = await upload(token, 'notes.md', content)
    expect(second.status).toBe(201)
    expect((second.body as KnowledgeDocument).id).toBe(firstDoc.id) // deduped to same doc

    const list = await listDocuments(token)
    expect(list.body as KnowledgeDocument[]).toHaveLength(1)

    const chunks = app.get<Model<ChunkDocument>>(getModelToken(Chunk.name))
    expect(await chunks.countDocuments({ documentId: firstDoc.id })).toBe(firstDoc.chunkCount)
  })

  it('a user cannot delete a document they do not own', async () => {
    const alex = await login(app, 'alex@example.com')
    const sam = await login(app, 'sam@example.com')
    const doc = (await upload(alex, 'a.md', 'alex private notes')).body as KnowledgeDocument

    const del = await request(app.getHttpServer())
      .delete(`/knowledge/documents/${doc.id}`)
      .set('Authorization', `Bearer ${sam}`)
    expect(del.status).toBe(404)

    const alexList = await listDocuments(alex)
    expect(alexList.body as KnowledgeDocument[]).toHaveLength(1) // still there
  })

  it('lists only documents owned by the caller', async () => {
    const alex = await login(app, 'alex@example.com')
    const sam = await login(app, 'sam@example.com')
    await upload(alex, 'a.md', 'alex notes')

    const samList = await listDocuments(sam)
    expect(samList.body as KnowledgeDocument[]).toHaveLength(0)
  })
})
