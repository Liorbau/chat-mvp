import { useRef } from 'react'
import { HIDDEN_INPUT_STYLE, UPLOAD_LABEL_STYLE } from './KnowledgeDocuments.constants'
import type { KnowledgeUploadProps } from './KnowledgeDocuments.types'

export function KnowledgeUpload({ busy, onFile }: KnowledgeUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <label className={UPLOAD_LABEL_STYLE}>
      {busy ? 'Uploading…' : '+ Upload'}
      <input
        ref={inputRef}
        type="file"
        accept=".md,.txt,.markdown,text/plain,text/markdown"
        className={HIDDEN_INPUT_STYLE}
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file !== undefined) {
            onFile(file)
          }
          if (inputRef.current !== null) {
            inputRef.current.value = ''
          }
        }}
      />
    </label>
  )
}
