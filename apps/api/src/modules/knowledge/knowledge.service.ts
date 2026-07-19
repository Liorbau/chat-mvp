import { createHash } from 'node:crypto'
import { Embeddings } from '@langchain/core/embeddings'
import { Injectable, Logger } from '@nestjs/common'
import type { KnowledgeDocument } from '@chat/contract'
import { AppError } from '../../errors/AppError'
import { KnowledgeDbService } from './knowledge.dbService'
import {
  chunkText,
  documentToText,
  toChunkDrafts,
  type UploadedDocument,
} from './knowledge.chunking'

export type { UploadedDocument } from './knowledge.chunking'

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name)

  constructor(
    private readonly knowledgeDb: KnowledgeDbService,
    private readonly embeddings: Embeddings,
  ) {}

  async ingest(userId: string, file: UploadedDocument): Promise<KnowledgeDocument> {
    // Extract first, so an unsupported/empty upload fails (400) before any write.
    const text = documentToText(file)
    const contentHash = createHash('sha256').update(file.buffer).digest('hex')

    const existing = await this.knowledgeDb.findByHash(userId, contentHash)
    if (existing?.status === 'ready') {
      // Dedup: identical content already ingested — no re-embed, no duplicates.
      return existing
    }
    if (existing) {
      // A prior pending/failed attempt for this content — clear it and retry.
      await this.knowledgeDb.deleteChunksByDocument(existing.id)
      await this.knowledgeDb.deleteDocument(existing.id)
    }

    const doc = await this.knowledgeDb.create({
      userId,
      name: file.name,
      mimeType: file.mimeType,
      contentHash,
    })

    try {
      const chunks = await chunkText(text)
      const vectors = await this.embeddings.embedDocuments(chunks)
      const drafts = toChunkDrafts(doc.id, file.name, userId, chunks, vectors)
      await this.knowledgeDb.insertChunks(drafts)
      return await this.knowledgeDb.setStatus(doc.id, 'ready', drafts.length)
    } catch (error) {
      this.logger.error(`Ingestion failed for document ${doc.id}`, error)
      return await this.knowledgeDb.setStatus(doc.id, 'failed', 0)
    }
  }

  async listDocuments(userId: string): Promise<KnowledgeDocument[]> {
    return this.knowledgeDb.listByUser(userId)
  }

  // Authz baked into the lookup: another user's id resolves to undefined -> 404.
  async removeDocument(userId: string, id: string): Promise<string> {
    const doc = await this.knowledgeDb.findByIdAndUser(id, userId)
    if (doc === undefined) {
      throw AppError.notFound('Document not found')
    }
    await this.knowledgeDb.deleteChunksByDocument(id)
    await this.knowledgeDb.deleteDocument(id)
    return id
  }
}
