import { useRef } from 'react';

/**
 * Counts how many times the component has rendered (debug helper).
 * In development with `<StrictMode>` React renders twice, so the number doubles.
 *
 * @example
 * const renders = useRenderCount();
 */
export function useRenderCount(): number {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}
