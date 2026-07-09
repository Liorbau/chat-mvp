import { createHash } from 'node:crypto'
import { Embeddings } from '@langchain/core/embeddings'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { Injectable, Logger } from '@nestjs/common'
import type { KnowledgeDocument } from '@chat/contract'
import { AppError } from '../../errors/AppError'
import { type ChunkDraft, KnowledgeDbService } from './knowledge.dbService'

const CHUNK_SIZE = 500
const CHUNK_OVERLAP = 75

const SUPPORTED_TEXT_TYPES = ['text/plain', 'text/markdown', 'text/x-markdown']
const SUPPORTED_EXTENSIONS = /\.(md|markdown|txt)$/i

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: CHUNK_SIZE,
  chunkOverlap: CHUNK_OVERLAP,
})

export type UploadedDocument = {
  name: string
  mimeType: string
  buffer: Buffer
}

function documentToText(file: UploadedDocument): string {
  const supported =
    SUPPORTED_TEXT_TYPES.includes(file.mimeType) || SUPPORTED_EXTENSIONS.test(file.name)
  if (!supported) {
    throw AppError.badRequest(
      'VALIDATION_ERROR',
      `Can't read "${file.name}". Upload a .md or .txt file.`,
    )
  }
  const text = file.buffer.toString('utf-8').trim()
  if (text === '') {
    throw AppError.badRequest('VALIDATION_ERROR', 'That file is empty — nothing to ingest.')
  }
  return text
}

function toChunkDrafts(
  documentId: string,
  documentName: string,
  userId: string,
  chunks: string[],
  vectors: number[][],
): ChunkDraft[] {
  const drafts: ChunkDraft[] = []
  for (let index = 0; index < chunks.length; index += 1) {
    const text = chunks[index]
    const embedding = vectors[index]
    if (text === undefined || embedding === undefined) {
      throw new Error('Chunk/embedding count mismatch during ingestion')
    }
    drafts.push({ documentId, documentName, userId, text, embedding, chunkIndex: index })
  }
  return drafts
}

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
      const chunks = await splitter.splitText(text)
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
