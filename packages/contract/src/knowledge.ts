export type DocumentStatus = 'pending' | 'ready' | 'failed'

export type KnowledgeDocument = {
  id: string
  name: string
  mimeType: string
  status: DocumentStatus
  chunkCount: number
  createdAt: string
}
