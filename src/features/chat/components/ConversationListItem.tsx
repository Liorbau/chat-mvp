import type { Conversation } from '../api/chatApi.types'

type ConversationListItemProps = {
  conversation: Conversation
  isSelected: boolean
  onSelect: (id: Conversation['id']) => void
}

const CONVERSATION_ITEM_STYLE = {
  listStyle: 'none',
  margin: 0,
}

const CONVERSATION_BUTTON_STYLE = {
  width: '100%',
  minHeight: '60px',
  border: 'none',
  borderBottom: '1px solid #dbe3ee',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  textAlign: 'left' as const,
  padding: '12px 14px',
  fontSize: '16px',
  fontWeight: 500,
  cursor: 'pointer',
}

const SELECTED_CONVERSATION_BUTTON_STYLE = {
  backgroundColor: '#eef4ff',
  boxShadow: 'inset 3px 0 0 #2563eb',
}

function ConversationListItem({ conversation, isSelected, onSelect }: ConversationListItemProps) {
  const buttonStyle = isSelected
    ? { ...CONVERSATION_BUTTON_STYLE, ...SELECTED_CONVERSATION_BUTTON_STYLE }
    : CONVERSATION_BUTTON_STYLE

  return (
    <li style={CONVERSATION_ITEM_STYLE}>
      <button
        type="button"
        style={buttonStyle}
        aria-current={isSelected ? 'true' : undefined}
        onClick={() => {
          onSelect(conversation.id)
        }}
      >
        {conversation.title}
      </button>
    </li>
  )
}

export default ConversationListItem
