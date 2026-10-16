import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Tracks whether the pointer is over an element.
 *
 * Without arguments it returns a ref to attach; with a ref it uses that ref.
 *
 * @example
 * const [ref, isHovered] = useHover<HTMLDivElement>();
 * <div ref={ref}>{isHovered ? 'Hovering!' : 'Hover me'}</div>
 */
export function useHover<T extends HTMLElement = HTMLElement>(
  externalRef?: RefObject<T | null>,
): [ref: RefObject<T | null>, isHovered: boolean] {
  const internalRef = useRef<T | null>(null);
  const ref = externalRef ?? internalRef;
  const [isHovered, setIsHovered] = useState(false);

  const onEnter = useCallback(() => setIsHovered(true), []);
  const onLeave = useCallback(() => setIsHovered(false), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      setIsHovered(false);
    };
  }, [ref, onEnter, onLeave]);

  return [ref, isHovered];
}
