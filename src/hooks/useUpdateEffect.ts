import { useEffect, useRef } from 'react';
import type { DependencyList, EffectCallback } from 'react';

/**
 * Like `useEffect` but **skips the first run** (only runs on updates).
 *
 * @example
 * useUpdateEffect(() => {
 *   console.log('page changed (not on mount)');
 * }, [page]);
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // reset on unmount so React StrictMode's fake unmount/mount does not break it
  useEffect(
    () => () => {
      isFirst.current = true;
    },
    [],
  );
}
