import { useEffect } from 'react';
import type { EffectCallback } from 'react';

/**
 * Run an effect only once on mount (cleanup runs on unmount).
 *
 * @example
 * useEffectOnce(() => {
 *   const id = setInterval(tick, 1000);
 *   return () => clearInterval(id);
 * });
 */
export function useEffectOnce(effect: EffectCallback): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}
