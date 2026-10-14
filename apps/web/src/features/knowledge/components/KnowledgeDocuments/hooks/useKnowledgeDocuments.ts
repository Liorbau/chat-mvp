import { useEffect, useState, type ChangeEvent } from 'react'
import type { KnowledgeDocument } from '@chat/contract'
import { useFileDropzone } from '@/shared/hooks/useFileDropzone'
import {
  deleteKnowledgeDocument,
  getKnowledgeDocuments,
  uploadKnowledgeDocument,
} from '../apiActions/knowledge'
import {
  DELETE_FAILED_MESSAGE,
  LOAD_FAILED_MESSAGE,
  UPLOAD_FAILED_MESSAGE,
} from '../KnowledgeDocuments.constants'

type UseKnowledgeDocuments = {
  documents: KnowledgeDocument[]
  error: string | null
  busy: boolean
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove: (id: string) => void
} & ReturnType<typeof useFileDropzone>

function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback
}

export function useKnowledgeDocuments(): UseKnowledgeDocuments {
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
          setError(LOAD_FAILED_MESSAGE)
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
        setError(errorMessage(cause, UPLOAD_FAILED_MESSAGE))
      })
      .finally(() => {
        setBusy(false)
      })
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
    event.target.value = ''
  }

  function onRemove(id: string): void {
    setError(null)
    deleteKnowledgeDocument(id)
      .then(() => {
        setDocuments((current) => current.filter((document) => document.id !== id))
      })
      .catch((cause: unknown) => {
        setError(errorMessage(cause, DELETE_FAILED_MESSAGE))
      })
  }

  const dropzone = useFileDropzone(uploadFile, busy)

  return { documents, error, busy, onFileChange, onRemove, ...dropzone }
}
