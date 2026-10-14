import { DocumentList } from './components/DocumentList/DocumentList'
import { DocumentsError } from './components/DocumentsError/DocumentsError'
import { DocumentsHeader } from './components/DocumentsHeader/DocumentsHeader'
import { useKnowledgeDocumentsContext } from './KnowledgeDocuments.context'
import { wrapClass } from './KnowledgeDocuments.styles'

export function KnowledgeDocuments() {
  const { isDragging, dropzoneProps } = useKnowledgeDocumentsContext()

  return (
    <div className={wrapClass(isDragging)} {...dropzoneProps}>
      <DocumentsHeader />
      <DocumentList />
      <DocumentsError />
    </div>
  )
}
