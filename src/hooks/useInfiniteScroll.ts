import { useCallback, useEffect, useState } from 'react';
import { useLatest } from './useLatest';

export interface UseInfiniteScrollOptions {
  /** Called when the sentinel becomes visible */
  onLoadMore: () => void | Promise<void>;
  /** Stop when there is no more data */
  hasMore: boolean;
  /** Do not trigger while a request is in-flight */
  loading?: boolean;
  /** Start loading before the sentinel is really visible (default '200px') */
  rootMargin?: string;
  root?: Element | null;
}

/**
 * Infinite scroll: attach the returned ref to a sentinel element at the end of the list.
 *
 * @example
 * const sentinelRef = useInfiniteScroll({ onLoadMore: fetchNext, hasMore, loading });
 * <ul>{items}</ul><div ref={sentinelRef} />
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  loading = false,
  rootMargin = '200px',
  root = null,
}: UseInfiniteScrollOptions) {
  const [node, setNode] = useState<Element | null>(null);
  const loadRef = useLatest(onLoadMore);
  const active = hasMore && !loading;

  useEffect(() => {
    if (!node || !active || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadRef.current();
      },
      { root, rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, active, root, rootMargin, loadRef]);

  return useCallback((el: Element | null) => setNode(el), []);
}
