import type { KnowledgeDocument } from '@chat/contract'
import { API_BASE_URL, buildHeaders, request, throwApiError } from '@/api/apiClient'

export async function getKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  return request<KnowledgeDocument[]>('/knowledge/documents')
}

export async function deleteKnowledgeDocument(documentId: string): Promise<string> {
  const result = await request<{ id: string }>(`/knowledge/documents/${documentId}`, {
    method: 'DELETE',
  })
  return result.id
}

export async function uploadKnowledgeDocument(file: File): Promise<KnowledgeDocument> {
  const form = new FormData()
  form.append('file', file)
  // No Content-Type header: the browser sets multipart/form-data with a boundary.
  const response = await fetch(`${API_BASE_URL}/knowledge/documents`, {
    method: 'POST',
    headers: buildHeaders(false),
    body: form,
  })
  if (!response.ok) {
    await throwApiError(response)
  }
  return (await response.json()) as KnowledgeDocument
}
