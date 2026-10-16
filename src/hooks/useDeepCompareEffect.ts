import { useEffect, useMemo, useRef } from 'react';
import type { DependencyList, EffectCallback } from 'react';
import { isDeepEqual } from './utils';

/**
 * Memoizes a value by **deep equality**: returns the previous reference as
 * long as the new value is structurally equal.
 */
export function useDeepCompareMemoize<T>(value: T): T {
  const ref = useRef<T>(value);
  if (!isDeepEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}

/**
 * `useEffect` that compares its dependencies **deeply** — perfect when the
 * deps are objects / arrays created inline on every render.
 *
 * @example
 * useDeepCompareEffect(() => {
 *   fetchUsers(filters);
 * }, [filters]); // `filters` is a new object each render, but effect runs only when its content changes
 */
export function useDeepCompareEffect(effect: EffectCallback, deps: DependencyList): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, useDeepCompareMemoize(deps));
}

/**
 * `useMemo` with **deep** dependency comparison.
 *
 * @example
 * const result = useDeepCompareMemo(() => expensive(options), [options]);
 */
export function useDeepCompareMemo<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, useDeepCompareMemoize(deps));
}
