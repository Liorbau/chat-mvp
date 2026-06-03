const SKELETON_MESSAGE_ROWS = [
  { width: '56%', align: 'flex-start' as const },
  { width: '44%', align: 'flex-end' as const },
  { width: '62%', align: 'flex-start' as const },
  { width: '38%', align: 'flex-end' as const },
  { width: '52%', align: 'flex-start' as const },
  { width: '47%', align: 'flex-end' as const },
]

const THREAD_SKELETON_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '10px',
}

const MESSAGE_ROW_STYLE = {
  display: 'flex',
}

const MESSAGE_BUBBLE_SKELETON_STYLE = {
  height: '46px',
  borderRadius: '16px',
  backgroundColor: '#e2e8f0',
  border: '1px solid #d6e0ed',
}

function MessageThreadSkeleton() {
  return (
    <div aria-label="Loading messages" style={THREAD_SKELETON_STYLE}>
      {SKELETON_MESSAGE_ROWS.map((row, index) => {
        const rowStyle = {
          ...MESSAGE_ROW_STYLE,
          justifyContent: row.align,
        }
        const bubbleStyle = {
          ...MESSAGE_BUBBLE_SKELETON_STYLE,
          width: row.width,
        }

        return (
          <div key={index} style={rowStyle}>
            <div style={bubbleStyle} />
          </div>
        )
      })}
    </div>
  )
}

export default MessageThreadSkeleton
