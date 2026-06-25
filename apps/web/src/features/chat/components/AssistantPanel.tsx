import { useState } from 'react'
import { ASSISTANT_SENDER_ID } from '@chat/contract'
import { useAssistantChat } from '../hooks/useAssistantChat'
import { useScrollToBottom } from '../hooks/useScrollToBottom'

type AssistantPanelProps = {
  currentUserId: string
}

const PANEL_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  height: '100vh',
  width: '100%',
  backgroundColor: '#0b1220',
  color: '#e2e8f0',
}

const HEADER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 20px',
  borderBottom: '1px solid #1e293b',
}

const AVATAR_STYLE = {
  width: '34px',
  height: '34px',
  borderRadius: '9999px',
  background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
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

const COMPOSER_STYLE = {
  display: 'flex',
  gap: '10px',
  padding: '16px 20px',
  borderTop: '1px solid #1e293b',
}

const TEXTAREA_STYLE = {
  flex: 1,
  boxSizing: 'border-box' as const,
  borderRadius: '14px',
  border: '1px solid #334155',
  backgroundColor: '#111c30',
  color: '#e2e8f0',
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
  backgroundColor: '#6366f1',
  cursor: 'pointer',
}

const SEND_DISABLED_STYLE = { backgroundColor: '#475569', color: '#cbd5e1', cursor: 'not-allowed' }

const STATUS_STYLE = { fontSize: '13px', fontStyle: 'italic' as const, opacity: 0.75 }
const ERROR_STYLE = {
  margin: '0 20px',
  padding: '8px 12px',
  borderRadius: '10px',
  backgroundColor: '#7f1d1d',
  color: '#fee2e2',
  fontSize: '13px',
}
const EMPTY_STYLE = { margin: 'auto', textAlign: 'center' as const, opacity: 0.6, fontSize: '15px' }

function AssistantPanel({ currentUserId }: AssistantPanelProps) {
  const { messages, streamingText, status, isStreaming, isReady, error, send } =
    useAssistantChat(currentUserId)
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
        backgroundColor: mine ? '#6366f1' : '#1e293b',
        color: mine ? '#ffffff' : '#e2e8f0',
      },
      who: senderId === ASSISTANT_SENDER_ID ? 'Assistant' : mine ? 'You' : senderId,
    }
  }

  return (
    <section style={PANEL_STYLE}>
      <header style={HEADER_STYLE}>
        <div style={AVATAR_STYLE}>✦</div>
        <strong style={{ fontSize: '16px' }}>Assistant</strong>
      </header>

      {error !== null ? (
        <div style={ERROR_STYLE} role="alert">
          {error}
        </div>
      ) : null}

      <div style={MESSAGES_STYLE}>
        {messages.length === 0 && streamingText === null && !isStreaming ? (
          <p style={EMPTY_STYLE}>Ask me anything about your chats.</p>
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
              </div>
            </div>
          )
        })}

        {isStreaming ? (
          <div style={{ ...ROW_STYLE, justifyContent: 'flex-end' }}>
            <div style={{ ...BASE_BUBBLE_STYLE, backgroundColor: '#1e293b' }}>
              {streamingText !== null && streamingText.length > 0 ? (
                streamingText
              ) : (
                <span style={STATUS_STYLE}>
                  {status === 'tool_call' ? 'Looking through your chats…' : 'Thinking…'}
                </span>
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
          placeholder={isStreaming ? 'Waiting for the assistant…' : 'Message the assistant…'}
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

export default AssistantPanel
