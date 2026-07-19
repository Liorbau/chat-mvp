import type { KnowledgeDocument } from '@chat/contract'
import { DELETE_STYLE, ITEM_STYLE, STATUS_META_STYLE } from './KnowledgeDocuments.constants'
import type { KnowledgeDocumentItemProps } from './KnowledgeDocuments.types'

function statusLabel(document: KnowledgeDocument): string {
  return document.status === 'ready' ? `${String(document.chunkCount)} chunks` : document.status
}

export function KnowledgeDocumentItem({ document, onRemove }: KnowledgeDocumentItemProps) {
  return (
    <div className={ITEM_STYLE}>
      <span>
        {document.name} <span className={STATUS_META_STYLE}>({statusLabel(document)})</span>
      </span>
      <button
        type="button"
        className={DELETE_STYLE}
        aria-label={`Delete ${document.name}`}
        onClick={() => {
          onRemove(document.id)
        }}
      >
        ×
      </button>
    </div>
  )
}
