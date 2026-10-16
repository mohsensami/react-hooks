import { useCallback, useRef } from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'
import type { AnyFn } from './utils'

/**
 * Returns a function with a STABLE identity that always calls the latest `fn`.
 * Great for event handlers passed to memoized children or effects.
 * (Similar to React 19.2's `useEffectEvent`, but usable anywhere, not only in effects.)
 * @example
 * const onSave = useEventCallback(() => save(form))
 */
export function useEventCallback<T extends AnyFn>(fn: T): T {
  const ref = useRef(fn)
  useIsomorphicLayoutEffect(() => {
    ref.current = fn
  })
  return useCallback(((...args: Parameters<T>) => ref.current(...args)) as T, [])
}
