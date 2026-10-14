import { createContext, useContext } from 'react'
import type { KnowledgeDocumentsContextValue } from './KnowledgeDocuments.types'

export const KnowledgeDocumentsContext = createContext<KnowledgeDocumentsContextValue | null>(null)

export function useKnowledgeDocumentsContext(): KnowledgeDocumentsContextValue {
  const context = useContext(KnowledgeDocumentsContext)
  if (context == null) {
    throw new Error(
      'useKnowledgeDocumentsContext must be used inside <KnowledgeDocumentsContainer>',
    )
  }
  return context
}
