import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useLatest } from './useLatest';
import { resolveTarget } from './utils';

/**
 * Observe size changes of an element with `ResizeObserver`.
 *
 * @example
 * useResizeObserver(boxRef, (entry) => console.log(entry.contentRect.width));
 */
export function useResizeObserver<T extends Element = Element>(
  target: RefObject<T | null> | T | null,
  callback: (entry: ResizeObserverEntry) => void,
  options?: ResizeObserverOptions,
): void {
  const callbackRef = useLatest(callback);
  const box = options?.box;

  useEffect(() => {
    const el = resolveTarget(target as EventTarget | RefObject<EventTarget | null> | null) as Element | null;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) callbackRef.current(entry);
    });
    observer.observe(el, { box });
    return () => observer.disconnect();
  }, [target, box, callbackRef]);
}
