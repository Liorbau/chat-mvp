import { useEffect, useRef, useState } from 'react'
import type { KnowledgeDocument } from '@chat/contract'
import {
  deleteKnowledgeDocument,
  getKnowledgeDocuments,
  uploadKnowledgeDocument,
} from '../api/apiClient'

const WRAP_STYLE = {
  padding: '12px 20px',
  borderBottom: '1px solid #4c1d24',
  backgroundColor: '#241013',
}

const DRAGGING_STYLE = { outline: '2px dashed #f87171', outlineOffset: '-6px' }

const HEADER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px',
}

const TITLE_STYLE = { fontSize: '13px', fontWeight: 600, color: '#fca5a5' }

const UPLOAD_LABEL_STYLE = {
  fontSize: '12px',
  color: '#ffffff',
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  padding: '6px 10px',
  cursor: 'pointer',
}

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '6px',
  maxHeight: '140px',
  overflowY: 'auto' as const,
}
const ITEM_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  fontSize: '13px',
  color: '#fecaca',
}
const DELETE_STYLE = {
  border: 'none',
  background: 'transparent',
  color: '#f87171',
  cursor: 'pointer',
  fontSize: '16px',
  lineHeight: 1,
}
const ERROR_STYLE = { color: '#fca5a5', fontSize: '12px', marginTop: '6px' }

function statusLabel(document: KnowledgeDocument): string {
  return document.status === 'ready' ? `${String(document.chunkCount)} chunks` : document.status
}

function KnowledgeDocuments() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

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
    <div
      style={dragging ? { ...WRAP_STYLE, ...DRAGGING_STYLE } : WRAP_STYLE}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        const file = event.dataTransfer.files?.[0]
        if (file !== undefined) {
          uploadFile(file)
        }
      }}
    >
      <div style={HEADER_STYLE}>
        <span style={TITLE_STYLE}>My documents</span>
        <label style={UPLOAD_LABEL_STYLE}>
          {busy ? 'Uploading…' : '+ Upload'}
          <input
            ref={inputRef}
            type="file"
            accept=".md,.txt,.markdown,text/plain,text/markdown"
            style={{ display: 'none' }}
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file !== undefined) {
                uploadFile(file)
              }
              if (inputRef.current !== null) {
                inputRef.current.value = ''
              }
            }}
          />
        </label>
      </div>

      {documents.length > 0 ? (
        <div style={LIST_STYLE}>
          {documents.map((document) => (
            <div key={document.id} style={ITEM_STYLE}>
              <span>
                {document.name} <span style={{ opacity: 0.6 }}>({statusLabel(document)})</span>
              </span>
              <button
                type="button"
                style={DELETE_STYLE}
                aria-label={`Delete ${document.name}`}
                onClick={() => {
                  removeDocument(document.id)
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {error !== null ? <div style={ERROR_STYLE}>{error}</div> : null}
    </div>
  )
}

export default KnowledgeDocuments
