import { useKnowledgeDocumentsContext } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.context'
import { LIST_STYLE } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.styles'
import { KnowledgeDocumentItem } from './components/KnowledgeDocumentItem/KnowledgeDocumentItem'

export function DocumentList() {
  const { documents } = useKnowledgeDocumentsContext()
  return documents.length > 0 ? (
    <div className={LIST_STYLE}>
      {documents.map((document) => (
        <KnowledgeDocumentItem key={document.id} document={document} />
      ))}
    </div>
  ) : null
}
