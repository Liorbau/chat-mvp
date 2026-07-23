import { useFileDropzone } from '@/shared/hooks/useFileDropzone'
import {
  DRAGGING_STYLE,
  ERROR_STYLE,
  HEADER_STYLE,
  LIST_STYLE,
  TITLE_STYLE,
  WRAP_STYLE,
} from './KnowledgeDocuments.styles'
import { KnowledgeDocumentItem } from './components/KnowledgeDocumentItem/KnowledgeDocumentItem'
import { KnowledgeUpload } from './components/KnowledgeUpload/KnowledgeUpload'
import type { KnowledgeDocumentsViewProps } from './KnowledgeDocuments.types'

export function KnowledgeDocuments({
  documents,
  error,
  busy,
  onUpload,
  onRemove,
}: KnowledgeDocumentsViewProps) {
  const { isDragging, dropzoneProps } = useFileDropzone(onUpload, busy)

  return (
    <div className={isDragging ? `${WRAP_STYLE} ${DRAGGING_STYLE}` : WRAP_STYLE} {...dropzoneProps}>
      <div className={HEADER_STYLE}>
        <span className={TITLE_STYLE}>My documents</span>
        <KnowledgeUpload busy={busy} onFile={onUpload} />
      </div>

      {documents.length > 0 ? (
        <div className={LIST_STYLE}>
          {documents.map((document) => (
            <KnowledgeDocumentItem key={document.id} document={document} onRemove={onRemove} />
          ))}
        </div>
      ) : null}

      {error != null ? <div className={ERROR_STYLE}>{error}</div> : null}
    </div>
  )
}
