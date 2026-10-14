import type { KnowledgeDocument } from '@chat/contract'
import type { useKnowledgeDocuments } from './hooks/useKnowledgeDocuments'

export type KnowledgeDocumentsContextValue = ReturnType<typeof useKnowledgeDocuments>

export type KnowledgeDocumentItemProps = {
  document: KnowledgeDocument
}
