const SKELETON_ITEMS = [1, 2, 3, 4]

const SKELETON_ITEM_STYLE = {
  height: '48px',
  borderRadius: '8px',
  backgroundColor: '#e2e8f0',
  marginBottom: '10px',
}

function ConversationListSkeleton() {
  return (
    <div aria-label="Loading conversations">
      {SKELETON_ITEMS.map((item) => {
        return <div key={item} style={SKELETON_ITEM_STYLE} />
      })}
    </div>
  )
}

export default ConversationListSkeleton
