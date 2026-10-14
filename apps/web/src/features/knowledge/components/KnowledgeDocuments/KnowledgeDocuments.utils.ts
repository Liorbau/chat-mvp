import type { KnowledgeDocument } from '@chat/contract'
import { UPLOAD_LABEL, UPLOADING_LABEL } from './KnowledgeDocuments.constants'

export function statusLabel(document: KnowledgeDocument): string {
  return document.status === 'ready' ? `${String(document.chunkCount)} chunks` : document.status
}

export function uploadLabel(busy: boolean): string {
  return busy ? UPLOADING_LABEL : UPLOAD_LABEL
}

export function deleteLabel(document: KnowledgeDocument): string {
  return `Delete ${document.name}`
}
