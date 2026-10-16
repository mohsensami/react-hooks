import { useCallback, useEffect, useState } from 'react';

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** Stop observing after the element became visible once */
  freezeOnceVisible?: boolean;
}

/**
 * Know when an element enters/leaves the viewport (lazy load, animations, infinite scroll).
 *
 * @example
 * const [ref, isVisible, entry] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.5 });
 * <div ref={ref}>{isVisible ? 'I am visible' : 'hidden'}</div>
 */
export function useIntersectionObserver<T extends Element = HTMLElement>({
  threshold = 0,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
}: UseIntersectionObserverOptions = {}) {
  const [node, setNode] = useState<T | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const frozen = freezeOnceVisible && entry?.isIntersecting === true;
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : String(threshold);

  useEffect(() => {
    if (!node || frozen || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([e]) => setEntry(e), { threshold, root, rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, frozen, thresholdKey, root, rootMargin]);

  const ref = useCallback((el: T | null) => setNode(el), []);
  return [ref, entry?.isIntersecting ?? false, entry] as const;
}
