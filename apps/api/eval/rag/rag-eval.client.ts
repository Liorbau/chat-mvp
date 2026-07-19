import type { AssistantSseEvent, Citation } from '@chat/contract'

// Drives the real API end-to-end. Requires `npm run dev:api` running.
const API = process.env.EVAL_API_BASE_URL ?? 'http://localhost:4000'

export type TurnResult = { answer: string; citations: Citation[] }

export async function signup(): Promise<string> {
  const email = `eval_${String(process.pid)}_${String(Math.floor(Date.now() / 1000))}@example.com`
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123', firstName: 'Eval', lastName: 'Run' }),
  })
  if (!res.ok) {
    throw new Error(`signup failed (${String(res.status)})`)
  }
  const body = (await res.json()) as { token: string }
  return body.token
}

// Returns the document's chunk count (the "relevant chunks" total for recall).
export async function uploadDoc(token: string, name: string, content: string): Promise<number> {
  const form = new FormData()
  form.append('file', new Blob([content], { type: 'text/markdown' }), name)
  const res = await fetch(`${API}/knowledge/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!res.ok) {
    throw new Error(`upload ${name} failed (${String(res.status)})`)
  }
  const body = (await res.json()) as { chunkCount: number }
  return body.chunkCount
}

export async function createTutorConversation(token: string): Promise<string> {
  const res = await fetch(`${API}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ type: 'tutor' }),
  })
  const body = (await res.json()) as { id: string }
  return body.id
}

export async function askTutor(
  token: string,
  conversationId: string,
  content: string,
): Promise<TurnResult> {
  const res = await fetch(`${API}/ai/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  })
  if (res.body === null) {
    throw new Error('no SSE body')
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let answer = ''
  let citations: Citation[] = []
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary).trim()
      buffer = buffer.slice(boundary + 2)
      if (frame.startsWith('data:')) {
        const event = JSON.parse(frame.slice(5).trim()) as AssistantSseEvent
        if (event.type === 'token') {
          answer += event.value
        } else if (event.type === 'done') {
          citations = event.citations ?? []
        }
      }
      boundary = buffer.indexOf('\n\n')
    }
  }
  return { answer, citations }
}
