import { useCallback, useRef } from 'react';

/**
 * Smoothly scroll an element into view with an optional offset (sticky headers).
 *
 * @example
 * const { ref, scroll } = useScrollIntoView<HTMLDivElement>({ offset: 80 });
 * <button onClick={scroll}>Go</button> ... <div ref={ref}>Target</div>
 */
export function useScrollIntoView<T extends HTMLElement = HTMLElement>({
  offset = 0,
  behavior = 'smooth',
}: { offset?: number; behavior?: ScrollBehavior } = {}) {
  const ref = useRef<T>(null);
  const scroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior });
  }, [offset, behavior]);
  return { ref, scroll };
}
