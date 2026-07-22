import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Collection } from 'mongodb'
import type { Model } from 'mongoose'
import { Chunk as ChunkModel, type ChunkDocument } from '../schemas/chunk.schema'

export type ChunkDraft = {
  documentId: string
  documentName: string
  userId: string
  text: string
  embedding: number[]
  chunkIndex: number
}

@Injectable()
export class ChunkDbService {
  constructor(
    @InjectModel(ChunkModel.name)
    private readonly chunkModel: Model<ChunkDocument>,
  ) {}

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
    if (!db) {
      throw new Error('Mongo connection is not ready')
    }
    return db.collection(this.chunkModel.collection.collectionName)
  }
}
