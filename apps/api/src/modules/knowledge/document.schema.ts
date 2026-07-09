import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { DocumentStatus } from '@chat/contract'
import type { HydratedDocument } from 'mongoose'

// The hydrated Mongoose object for a KnowledgeDocument (has .save() etc.), as
// opposed to the plain KnowledgeDocument class / the @chat/contract DTO.
export type MongooseKnowledgeDocument = HydratedDocument<KnowledgeDocument>

// Explicit name: Mongoose would pluralize to 'knowledgedocuments'.
@Schema({ collection: 'kb_documents', timestamps: { createdAt: true, updatedAt: false } })
export class KnowledgeDocument {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ required: true })
  userId!: string

  @Prop({ required: true })
  name!: string

  @Prop({ required: true })
  mimeType!: string

  @Prop({ required: true })
  contentHash!: string

  @Prop({ type: String, enum: ['pending', 'ready', 'failed'], required: true })
  status!: DocumentStatus

  @Prop({ default: 0 })
  chunkCount!: number

  createdAt!: Date
}

export const KnowledgeDocumentSchema = SchemaFactory.createForClass(KnowledgeDocument)

// Backs "list my documents, newest first".
KnowledgeDocumentSchema.index({ userId: 1, createdAt: -1 })

// Backs the dedup lookup (find a user's doc by content hash).
KnowledgeDocumentSchema.index({ userId: 1, contentHash: 1 })
