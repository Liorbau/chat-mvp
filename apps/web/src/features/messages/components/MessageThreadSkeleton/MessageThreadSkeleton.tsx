import {
  MESSAGE_BUBBLE_SKELETON_STYLE,
  MESSAGE_ROW_STYLE,
  SKELETON_MESSAGE_ROWS,
  THREAD_SKELETON_STYLE,
} from './MessageThreadSkeleton.constants'

export function MessageThreadSkeleton() {
  return (
    <div aria-label="Loading messages" className={THREAD_SKELETON_STYLE}>
      {SKELETON_MESSAGE_ROWS.map((row, index) => (
        <div key={index} className={`${MESSAGE_ROW_STYLE} ${row.align}`}>
          <div className={`${MESSAGE_BUBBLE_SKELETON_STYLE} ${row.width}`} />
        </div>
      ))}
    </div>
  )
}
