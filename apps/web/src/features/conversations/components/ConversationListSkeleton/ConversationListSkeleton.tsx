import { SKELETON_ITEMS } from './ConversationListSkeleton.constants'
import { SKELETON_ITEM_STYLE } from './ConversationListSkeleton.styles'

export function ConversationListSkeleton() {
  return (
    <div aria-label="Loading conversations">
      {SKELETON_ITEMS.map((item) => {
        return <div key={item} className={SKELETON_ITEM_STYLE} />
      })}
    </div>
  )
}
