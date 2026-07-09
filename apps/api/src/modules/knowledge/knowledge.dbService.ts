import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { DocumentStatus, KnowledgeDocument } from '@chat/contract'
import type { Collection } from 'mongodb'
import type { Model } from 'mongoose'
import { Chunk as ChunkModel, type ChunkDocument } from './chunk.schema'
import {
  KnowledgeDocument as KnowledgeDocumentModel,
  type MongooseKnowledgeDocument,
} from './document.schema'

export type DocumentDraft = {
  userId: string
  name: string
  mimeType: string
  contentHash: string
}

export type ChunkDraft = {
  documentId: string
  documentName: string
  userId: string
  text: string
  embedding: number[]
  chunkIndex: number
}

function toKnowledgeDocument(doc: MongooseKnowledgeDocument): KnowledgeDocument {
  return {
    id: doc._id,
    name: doc.name,
    mimeType: doc.mimeType,
    status: doc.status,
    chunkCount: doc.chunkCount,
    createdAt: doc.createdAt.toISOString(),
  }
}

@Injectable()
export class KnowledgeDbService {
  constructor(
    @InjectModel(KnowledgeDocumentModel.name)
    private readonly documentModel: Model<MongooseKnowledgeDocument>,
    @InjectModel(ChunkModel.name)
    private readonly chunkModel: Model<ChunkDocument>,
  ) {}

  async findByHash(userId: string, contentHash: string): Promise<KnowledgeDocument | undefined> {
    const doc = await this.documentModel.findOne({ userId, contentHash }).exec()
    return doc === null ? undefined : toKnowledgeDocument(doc)
  }

  async findByIdAndUser(id: string, userId: string): Promise<KnowledgeDocument | undefined> {
    const doc = await this.documentModel.findOne({ _id: id, userId }).exec()
    return doc === null ? undefined : toKnowledgeDocument(doc)
  }

  async listByUser(userId: string): Promise<KnowledgeDocument[]> {
    const docs = await this.documentModel.find({ userId }).sort({ createdAt: -1 }).exec()
    return docs.map(toKnowledgeDocument)
  }

  async create(draft: DocumentDraft): Promise<KnowledgeDocument> {
    const doc = await this.documentModel.create({
      _id: randomUUID(),
      userId: draft.userId,
      name: draft.name,
      mimeType: draft.mimeType,
      contentHash: draft.contentHash,
      status: 'pending',
      chunkCount: 0,
    })
    return toKnowledgeDocument(doc)
  }

  async setStatus(
    id: string,
    status: DocumentStatus,
    chunkCount: number,
  ): Promise<KnowledgeDocument> {
    const doc = await this.documentModel
      .findOneAndUpdate({ _id: id }, { $set: { status, chunkCount } }, { returnDocument: 'after' })
      .exec()
    if (doc === null) {
      throw new Error(`Document ${id} vanished while updating status`)
    }
    return toKnowledgeDocument(doc)
  }

  async deleteDocument(id: string): Promise<number> {
    const result = await this.documentModel.deleteOne({ _id: id }).exec()
    return result.deletedCount
  }

  async insertChunks(chunks: ChunkDraft[]): Promise<number> {
    if (chunks.length === 0) {
      return 0
    }
    const created = await this.chunkModel.insertMany(
      chunks.map((chunk) => ({ _id: randomUUID(), ...chunk })),
    )
    return created.length
  }

  async deleteChunksByDocument(documentId: string): Promise<number> {
    const result = await this.chunkModel.deleteMany({ documentId }).exec()
    return result.deletedCount
  }

  // Native collection for the LangChain vector store (needs the raw driver handle).
  chunkCollection(): Collection {
    const db = this.chunkModel.db.db
    if (db === undefined) {
      throw new Error('Mongo connection is not ready')
    }
    return db.collection(this.chunkModel.collection.collectionName)
  }
}
