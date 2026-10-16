import { useEffect, useRef } from 'react';
import type { DependencyList, EffectCallback } from 'react';

/**
 * `useEffect` with a **custom comparison function** for the dependencies.
 * The effect re-runs only when `compare(prevDeps, nextDeps)` returns `false`.
 *
 * @example
 * useCustomCompareEffect(
 *   () => { draw(shape); },
 *   [shape],
 *   (prev, next) => prev[0].id === next[0].id,
 * );
 */
export function useCustomCompareEffect<Deps extends DependencyList>(
  effect: EffectCallback,
  deps: Deps,
  compare: (prev: Deps, next: Deps) => boolean,
): void {
  const ref = useRef<Deps | undefined>(undefined);
  const signal = useRef(0);

  if (ref.current === undefined || !compare(ref.current, deps)) {
    ref.current = deps;
    signal.current += 1;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [signal.current]);
}
