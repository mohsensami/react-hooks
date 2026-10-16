import { useEffect, useRef } from 'react'
import type { DependencyList, EffectCallback } from 'react'

/**
 * `useEffect` with your own dependency comparison.
 * @example useCustomCompareEffect(fn, [user], (a, b) => a[0].id === b[0].id)
 */
export function useCustomCompareEffect<D extends DependencyList>(
  effect: EffectCallback,
  deps: D,
  compare: (prev: D, next: D) => boolean,
) {
  const signal = useRef(0)
  const prev = useRef<D>(deps)
  if (!compare(prev.current, deps)) {
    prev.current = deps
    signal.current += 1
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [signal.current])
}
