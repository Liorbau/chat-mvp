import { SKELETON_ITEM_STYLE, SKELETON_ITEMS } from './ConversationListSkeleton.constants'

export function ConversationListSkeleton() {
  return (
    <div aria-label="Loading conversations">
      {SKELETON_ITEMS.map((item) => {
        return <div key={item} className={SKELETON_ITEM_STYLE} />
      })}
    </div>
  )
}
