import { useCallback, useEffect, useRef } from 'react'

/**
 * Gives a fresh AbortSignal for every call and aborts the previous one.
 * Automatically aborts on unmount.
 * @example const { getSignal } = useAbortController(); fetch(url, { signal: getSignal() })
 */
export function useAbortController() {
  const ref = useRef<AbortController | null>(null)
  const abort = useCallback((reason?: unknown) => {
    ref.current?.abort(reason)
    ref.current = null
  }, [])
  const getSignal = useCallback(() => {
    ref.current?.abort()
    ref.current = new AbortController()
    return ref.current.signal
  }, [])
  useEffect(() => () => abort(), [abort])
  return { getSignal, abort }
}
