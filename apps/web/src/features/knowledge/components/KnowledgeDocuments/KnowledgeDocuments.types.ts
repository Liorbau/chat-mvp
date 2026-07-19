import type { KnowledgeDocument } from '@chat/contract'

export type KnowledgeDocumentsViewProps = {
  documents: KnowledgeDocument[]
  error: string | null
  busy: boolean
  onUpload: (file: File) => void
  onRemove: (id: string) => void
}

export type KnowledgeUploadProps = {
  busy: boolean
  onFile: (file: File) => void
}

export type KnowledgeDocumentItemProps = {
  document: KnowledgeDocument
  onRemove: (id: string) => void
}
