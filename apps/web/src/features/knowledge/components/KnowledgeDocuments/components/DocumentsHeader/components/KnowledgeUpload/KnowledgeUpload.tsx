import { DOCUMENT_ACCEPT } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.constants'
import { useKnowledgeDocumentsContext } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.context'
import {
  HIDDEN_INPUT_STYLE,
  UPLOAD_LABEL_STYLE,
} from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.styles'
import { uploadLabel } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocuments.utils'

export function KnowledgeUpload() {
  const { busy, onFileChange } = useKnowledgeDocumentsContext()

  return (
    <label className={UPLOAD_LABEL_STYLE}>
      {uploadLabel(busy)}
      <input
        type="file"
        accept={DOCUMENT_ACCEPT}
        className={HIDDEN_INPUT_STYLE}
        disabled={busy}
        onChange={onFileChange}
      />
    </label>
  )
}
