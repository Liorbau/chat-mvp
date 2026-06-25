import { useEffect, useRef, type DependencyList, type RefObject } from 'react'

// Scrolls the returned ref into view whenever `deps` change: an instant jump the
// first time content appears, smooth-scroll afterwards. `hasContent` gates the
// first scroll so an empty initial render doesn't consume the instant jump.
export function useScrollToBottom<T extends HTMLElement>(
  hasContent: boolean,
  deps: DependencyList,
): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const hasScrolledRef = useRef(false)

  useEffect(() => {
    if (!hasContent) {
      return
    }
    ref.current?.scrollIntoView({
      behavior: hasScrolledRef.current ? 'smooth' : 'auto',
      block: 'end',
    })
    hasScrolledRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
