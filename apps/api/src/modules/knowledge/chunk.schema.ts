import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

export type ChunkDocument = HydratedDocument<Chunk>

@Schema({ collection: 'kb_chunks' })
export class Chunk {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ required: true })
  documentId!: string

  @Prop({ required: true })
  documentName!: string

  @Prop({ required: true })
  userId!: string

  @Prop({ required: true })
  text!: string

  @Prop({ type: [Number], required: true })
  embedding!: number[]

  @Prop({ required: true })
  chunkIndex!: number
}

export const ChunkSchema = SchemaFactory.createForClass(Chunk)

ChunkSchema.index({ documentId: 1 })
