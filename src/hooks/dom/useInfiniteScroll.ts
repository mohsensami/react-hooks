import { useEffect, useState } from 'react'
import type { RefCallback } from 'react'
import { useLatest } from '../utils/useLatest'

export interface UseInfiniteScrollOptions {
  hasMore: boolean
  loading: boolean
  /** scroll container; default viewport */
  root?: Element | null
  /** start loading before the sentinel is really visible. default '200px' */
  rootMargin?: string
}

/**
 * Infinite scroll – put the returned ref on an element at the END of the list.
 * @example const sentinel = useInfiniteScroll(loadMore, { hasMore, loading }); <div ref={sentinel} />
 */
export function useInfiniteScroll<T extends Element = HTMLDivElement>(
  onLoadMore: () => void,
  { hasMore, loading, root = null, rootMargin = '200px' }: UseInfiniteScrollOptions,
): RefCallback<T> {
  const [el, setEl] = useState<T | null>(null)
  const cb = useLatest(onLoadMore)
  useEffect(() => {
    if (!el || !hasMore || loading || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && cb.current(), { root, rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [el, hasMore, loading, root, rootMargin, cb])
  return setEl
}
