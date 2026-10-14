import { useKnowledgeDocuments } from './hooks/useKnowledgeDocuments'
import { KnowledgeDocuments } from './KnowledgeDocuments'
import { KnowledgeDocumentsContext } from './KnowledgeDocuments.context'

export function KnowledgeDocumentsContainer() {
  const value = useKnowledgeDocuments()

  return (
    <KnowledgeDocumentsContext.Provider value={value}>
      <KnowledgeDocuments />
    </KnowledgeDocumentsContext.Provider>
  )
}
