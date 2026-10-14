import { DELETE_GLYPH } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.constants'
import { useKnowledgeDocumentsContext } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.context'
import {
  DELETE_STYLE,
  ITEM_STYLE,
  STATUS_META_STYLE,
} from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.styles'
import type { KnowledgeDocumentItemProps } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.types'
import {
  deleteLabel,
  statusLabel,
} from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.utils'

export function KnowledgeDocumentItem({ document }: KnowledgeDocumentItemProps) {
  const { onRemove } = useKnowledgeDocumentsContext()

  return (
    <div className={ITEM_STYLE}>
      <span>
        {document.name} <span className={STATUS_META_STYLE}>({statusLabel(document)})</span>
      </span>
      <button
        type="button"
        className={DELETE_STYLE}
        aria-label={deleteLabel(document)}
        onClick={() => {
          onRemove(document.id)
        }}
      >
        {DELETE_GLYPH}
      </button>
    </div>
  )
}
