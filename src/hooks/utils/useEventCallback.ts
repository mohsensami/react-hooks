import { useCallback } from 'react'
import type { AnyFn } from '../_internal'
import { useLatest } from './useLatest'

/**
 * Returns a function with a STABLE identity that always calls the latest
 * version of `fn` (never has stale closures). Great for event handlers
 * passed to memoized children or used in effect deps.
 */
export function useEventCallback<T extends AnyFn>(fn: T): T {
  const ref = useLatest(fn)
  return useCallback(((...args: Parameters<T>) => ref.current(...args)) as T, [ref])
}
