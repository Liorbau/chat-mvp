import { useEffect, useState } from 'react'
import type { KnowledgeDocument } from '@chat/contract'
import { deleteKnowledgeDocument, getKnowledgeDocuments, uploadKnowledgeDocument } from '@/api'
import { KnowledgeDocuments } from './KnowledgeDocuments'

export function KnowledgeDocumentsContainer() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    void getKnowledgeDocuments()
      .then((docs) => {
        if (active) {
          setDocuments(docs)
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load your documents.')
        }
      })
    return () => {
      active = false
    }
  }, [])

  function uploadFile(file: File): void {
    setBusy(true)
    setError(null)
    uploadKnowledgeDocument(file)
      .then(() => getKnowledgeDocuments())
      .then((docs) => {
        setDocuments(docs)
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'Upload failed.')
      })
      .finally(() => {
        setBusy(false)
      })
  }

  function removeDocument(id: string): void {
    setError(null)
    deleteKnowledgeDocument(id)
      .then(() => {
        setDocuments((current) => current.filter((document) => document.id !== id))
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'Could not delete that document.')
      })
  }

  return (
    <KnowledgeDocuments
      documents={documents}
      error={error}
      busy={busy}
      onUpload={uploadFile}
      onRemove={removeDocument}
    />
  )
}
