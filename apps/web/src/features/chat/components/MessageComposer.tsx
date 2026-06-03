import { useEffect, useRef, useState } from 'react'

type MessageComposerProps = {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

const COMPOSER_CONTAINER_STYLE = {
  position: 'sticky' as const,
  bottom: 0,
  backgroundColor: '#f8fafc',
  paddingTop: '8px',
}

const INPUT_WRAPPER_STYLE = {
  position: 'relative' as const,
  width: '100%',
}

const TEXTAREA_STYLE = {
  width: '100%',
  boxSizing: 'border-box' as const,
  borderRadius: '16px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#e9eef4',
  color: '#0f172a',
  padding: '12px 56px 12px 14px',
  fontSize: '16px',
  resize: 'none' as const,
  outline: 'none',
}

const SEND_BUTTON_STYLE = {
  position: 'absolute' as const,
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '34px',
  height: '34px',
  borderRadius: '9999px',
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  lineHeight: 1,
}

const SEND_BUTTON_DISABLED_STYLE = {
  opacity: 0.55,
  cursor: 'not-allowed',
}

function MessageComposer({ onSend, disabled = false }: MessageComposerProps) {
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const textAreaReference = useRef<HTMLTextAreaElement | null>(null)
  const shouldRefocusAfterSendRef = useRef(false)

  useEffect(() => {
    // Refocus only once the textarea is enabled again (isSending back to
    // false). Calling focus() while it is still disabled is a no-op, which is
    // why focus was lost after sending.
    if (!isSending && !disabled && shouldRefocusAfterSendRef.current) {
      shouldRefocusAfterSendRef.current = false
      textAreaReference.current?.focus()
    }
  }, [isSending, disabled])

  async function submitMessage() {
    const content = inputValue.trim()
    if (content.length === 0 || disabled || isSending) {
      return
    }

    setIsSending(true)
    try {
      await onSend(content)
      setInputValue('')
    } catch {
      // Keep current input so the user can edit and retry quickly.
    } finally {
      shouldRefocusAfterSendRef.current = true
      setIsSending(false)
    }
  }

  return (
    <div style={COMPOSER_CONTAINER_STYLE}>
      <div style={INPUT_WRAPPER_STYLE}>
        <textarea
          ref={textAreaReference}
          style={TEXTAREA_STYLE}
          value={inputValue}
          disabled={disabled || isSending}
          rows={3}
          placeholder="Type a message..."
          onChange={(event) => {
            setInputValue(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void submitMessage()
            }
          }}
        />
        <button
          type="button"
          style={
            disabled || isSending || inputValue.trim().length === 0
              ? { ...SEND_BUTTON_STYLE, ...SEND_BUTTON_DISABLED_STYLE }
              : SEND_BUTTON_STYLE
          }
          disabled={disabled || isSending || inputValue.trim().length === 0}
          onMouseDown={(event) => {
            // Keep focus in textarea after clicking send.
            event.preventDefault()
          }}
          onClick={() => {
            void submitMessage()
          }}
          aria-label="Send message"
        >
          {isSending ? '...' : '⏎'}
        </button>
      </div>
    </div>
  )
}

export default MessageComposer
