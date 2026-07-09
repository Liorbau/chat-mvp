import { useState } from 'react'
import { ASSISTANT_SENDER_ID, type Citation } from '@chat/contract'
import { useAssistantChat } from '../hooks/useAssistantChat'
import { useScrollToBottom } from '../hooks/useScrollToBottom'
import KnowledgeDocuments from './KnowledgeDocuments'

type TutorPanelProps = {
  currentUserId: string
}

const SOURCE_SNIPPET_MAX = 180

const PANEL_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  height: '100vh',
  width: '100%',
  backgroundColor: '#1a0e10',
  color: '#fecaca',
}

const HEADER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 20px',
  borderBottom: '1px solid #4c1d24',
}

const AVATAR_STYLE = {
  width: '34px',
  height: '34px',
  borderRadius: '9999px',
  background: 'linear-gradient(135deg, #dc2626, #f97316)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
}

const MESSAGES_STYLE = {
  flex: 1,
  overflowY: 'auto' as const,
  padding: '20px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
}

const ROW_STYLE = { display: 'flex' }

const BASE_BUBBLE_STYLE = {
  maxWidth: '72%',
  borderRadius: '16px',
  padding: '10px 14px',
  fontSize: '15px',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap' as const,
}

const SOURCES_STYLE = {
  marginTop: '8px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '4px',
}
const SOURCES_LABEL_STYLE = {
  fontSize: '11px',
  fontWeight: 600,
  opacity: 0.6,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}
const SOURCE_CARD_STYLE = {
  backgroundColor: '#2a1416',
  border: '1px solid #4c1d24',
  borderRadius: '8px',
  padding: '6px 10px',
}
const SOURCE_SUMMARY_STYLE = {
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600,
  color: '#fca5a5',
  listStyle: 'none' as const,
}
const SOURCE_TEXT_STYLE = {
  margin: '6px 0 0',
  fontSize: '12px',
  opacity: 0.75,
  whiteSpace: 'pre-wrap' as const,
}

const COMPOSER_STYLE = {
  display: 'flex',
  gap: '10px',
  padding: '16px 20px',
  borderTop: '1px solid #4c1d24',
}

const TEXTAREA_STYLE = {
  flex: 1,
  boxSizing: 'border-box' as const,
  borderRadius: '14px',
  border: '1px solid #4c1d24',
  backgroundColor: '#2a1416',
  color: '#fecaca',
  padding: '12px 14px',
  fontSize: '15px',
  resize: 'none' as const,
  outline: 'none',
}

const SEND_STYLE = {
  alignSelf: 'flex-end' as const,
  borderRadius: '12px',
  border: 'none',
  padding: '10px 16px',
  fontSize: '15px',
  color: '#ffffff',
  backgroundColor: '#dc2626',
  cursor: 'pointer',
}

const SEND_DISABLED_STYLE = { backgroundColor: '#7f1d1d', color: '#fca5a5', cursor: 'not-allowed' }

const STATUS_STYLE = { fontSize: '13px', fontStyle: 'italic' as const, opacity: 0.7 }
const ERROR_STYLE = {
  margin: '0 20px',
  padding: '8px 12px',
  borderRadius: '10px',
  backgroundColor: '#450a0a',
  color: '#fecaca',
  fontSize: '13px',
}
const EMPTY_STYLE = { margin: 'auto', textAlign: 'center' as const, opacity: 0.6, fontSize: '15px' }

function snippet(text: string): string {
  return text.length > SOURCE_SNIPPET_MAX ? `${text.slice(0, SOURCE_SNIPPET_MAX)}…` : text
}

function Sources({ citations }: { citations: Citation[] }) {
  return (
    <div style={SOURCES_STYLE}>
      <span style={SOURCES_LABEL_STYLE}>Sources</span>
      {citations.map((citation) => (
        <details key={citation.chunkId} style={SOURCE_CARD_STYLE}>
          <summary style={SOURCE_SUMMARY_STYLE}>📄 {citation.documentName}</summary>
          <p style={SOURCE_TEXT_STYLE}>{snippet(citation.text)}</p>
        </details>
      ))}
    </div>
  )
}

function TutorPanel({ currentUserId }: TutorPanelProps) {
  const { messages, streamingText, isStreaming, isReady, error, send } = useAssistantChat(
    currentUserId,
    'tutor',
  )
  const [input, setInput] = useState('')
  const endRef = useScrollToBottom<HTMLDivElement>(messages.length > 0 || streamingText !== null, [
    messages,
    streamingText,
  ])

  const canSend = isReady && !isStreaming && input.trim().length > 0

  function submit(): void {
    if (!canSend) {
      return
    }
    send(input.trim())
    setInput('')
  }

  function bubble(senderId: string): { row: object; bubble: object; who: string } {
    const mine = senderId === currentUserId
    return {
      row: { ...ROW_STYLE, justifyContent: mine ? 'flex-start' : 'flex-end' },
      bubble: {
        ...BASE_BUBBLE_STYLE,
        backgroundColor: mine ? '#dc2626' : '#3b1418',
        color: mine ? '#ffffff' : '#fecaca',
      },
      who: senderId === ASSISTANT_SENDER_ID ? 'Tutor' : mine ? 'You' : senderId,
    }
  }

  return (
    <section style={PANEL_STYLE}>
      <header style={HEADER_STYLE}>
        <div style={AVATAR_STYLE}>📖</div>
        <strong style={{ fontSize: '16px' }}>Tutor</strong>
      </header>

      <KnowledgeDocuments />

      {error !== null ? (
        <div style={ERROR_STYLE} role="alert">
          {error}
        </div>
      ) : null}

      <div style={MESSAGES_STYLE}>
        {messages.length === 0 && streamingText === null && !isStreaming ? (
          <p style={EMPTY_STYLE}>Ask a question about your uploaded notes.</p>
        ) : null}

        {messages.map((message) => {
          const styled = bubble(message.senderId)
          return (
            <div key={message.id} style={styled.row}>
              <div style={styled.bubble}>
                <span
                  style={{ display: 'block', fontSize: '11px', opacity: 0.7, marginBottom: '3px' }}
                >
                  {styled.who}
                </span>
                {message.content}
                {message.citations !== undefined && message.citations.length > 0 ? (
                  <Sources citations={message.citations} />
                ) : null}
              </div>
            </div>
          )
        })}

        {isStreaming ? (
          <div style={{ ...ROW_STYLE, justifyContent: 'flex-end' }}>
            <div style={{ ...BASE_BUBBLE_STYLE, backgroundColor: '#3b1418' }}>
              {streamingText !== null && streamingText.length > 0 ? (
                streamingText
              ) : (
                <span style={STATUS_STYLE}>Searching your notes…</span>
              )}
            </div>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      <div style={COMPOSER_STYLE}>
        <textarea
          style={TEXTAREA_STYLE}
          value={input}
          rows={2}
          placeholder={isStreaming ? 'Waiting for the tutor…' : 'Ask about your notes…'}
          onChange={(event) => {
            setInput(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
        />
        <button
          type="button"
          style={canSend ? SEND_STYLE : { ...SEND_STYLE, ...SEND_DISABLED_STYLE }}
          disabled={!canSend}
          onClick={submit}
        >
          Send
        </button>
      </div>
    </section>
  )
}

export default TutorPanel
