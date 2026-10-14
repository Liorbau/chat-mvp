import { useComposerContext } from '@/features/ai/context/composer.context'
import { KnowledgeDocumentsContainer } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocumentsContainer'

export function TutorDocuments() {
  const { conversationType } = useComposerContext()
  return conversationType === 'tutor' ? <KnowledgeDocumentsContainer /> : null
}
