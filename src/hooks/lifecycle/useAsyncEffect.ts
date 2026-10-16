import { useEffect } from 'react'
import type { DependencyList } from 'react'

/**
 * `useEffect` that accepts an async function.
 * The callback receives `isCancelled()` – check it after each `await`.
 * It may resolve with a cleanup function.
 * @example useAsyncEffect(async (cancelled) => { const r = await get(); if (!cancelled()) setData(r) }, [])
 */
export function useAsyncEffect(
  effect: (isCancelled: () => boolean) => Promise<void | (() => void)>,
  deps?: DependencyList,
) {
  useEffect(() => {
    let cancelled = false
    let cleanup: void | (() => void)
    effect(() => cancelled)
      .then((c) => {
        if (cancelled) {
          if (typeof c === 'function') c()
        } else cleanup = c
      })
      .catch((e) => console.error('[useAsyncEffect]', e))
    return () => {
      cancelled = true
      if (typeof cleanup === 'function') cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
