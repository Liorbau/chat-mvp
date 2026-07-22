import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { AppError } from '../../../errors/AppError'
import type { ChunkDraft } from '../repositories/chunk.dbService'

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

export function documentToText(file: UploadedDocument): string {
  const supported =
    SUPPORTED_TEXT_TYPES.includes(file.mimeType) || SUPPORTED_EXTENSIONS.test(file.name)
  if (!supported) {
    throw AppError.badRequest(`Can't read "${file.name}". Upload a .md or .txt file.`)
  }
  const text = file.buffer.toString('utf-8').trim()
  if (text === '') {
    throw AppError.badRequest('That file is empty — nothing to ingest.')
  }
  return text
}

export function chunkText(text: string): Promise<string[]> {
  return splitter.splitText(text)
}

export function toChunkDrafts(
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
    if (!text || !embedding) {
      throw new Error('Chunk/embedding count mismatch during ingestion')
    }
    drafts.push({ documentId, documentName, userId, text, embedding, chunkIndex: index })
  }
  return drafts
}
