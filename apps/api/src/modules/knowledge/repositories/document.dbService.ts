import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { DocumentStatus, KnowledgeDocument } from '@chat/contract'
import type { Model } from 'mongoose'
import {
  KnowledgeDocument as KnowledgeDocumentModel,
  type MongooseKnowledgeDocument,
} from '../schemas/document.schema'

export type DocumentDraft = {
  userId: string
  name: string
  mimeType: string
  contentHash: string
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
export class DocumentDbService {
  constructor(
    @InjectModel(KnowledgeDocumentModel.name)
    private readonly documentModel: Model<MongooseKnowledgeDocument>,
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
}
