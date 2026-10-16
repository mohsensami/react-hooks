import { useEffect, useMemo, useRef } from 'react'
import type { DependencyList, EffectCallback } from 'react'
import { deepEqual } from '../_internal'

/** `useEffect` that compares dependencies by deep equality (objects/arrays created inline are safe). */
export function useDeepCompareEffect(effect: EffectCallback, deps: DependencyList) {
  const signal = useRef(0)
  const prev = useRef<DependencyList>(deps)
  if (!deepEqual(prev.current, deps)) {
    prev.current = deps
    signal.current += 1
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [signal.current])
}

/** `useMemo` with deep-compared deps. */
export function useDeepCompareMemo<T>(factory: () => T, deps: DependencyList): T {
  const signal = useRef(0)
  const prev = useRef<DependencyList>(deps)
  if (!deepEqual(prev.current, deps)) {
    prev.current = deps
    signal.current += 1
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, [signal.current])
}
