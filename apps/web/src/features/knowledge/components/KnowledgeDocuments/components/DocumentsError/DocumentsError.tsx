import { useKnowledgeDocumentsContext } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.context'
import { ERROR_STYLE } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.styles'

export function DocumentsError() {
  const { error } = useKnowledgeDocumentsContext()
  return error == null ? null : <div className={ERROR_STYLE}>{error}</div>
}
