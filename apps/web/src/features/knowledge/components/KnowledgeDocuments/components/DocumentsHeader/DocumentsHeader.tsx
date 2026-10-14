import { DOCUMENTS_TITLE } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.constants'
import {
  HEADER_STYLE,
  TITLE_STYLE,
} from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.styles'
import { KnowledgeUpload } from './components/KnowledgeUpload/KnowledgeUpload'

export function DocumentsHeader() {
  return (
    <div className={HEADER_STYLE}>
      <span className={TITLE_STYLE}>{DOCUMENTS_TITLE}</span>
      <KnowledgeUpload />
    </div>
  )
}
