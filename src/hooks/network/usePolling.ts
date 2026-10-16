import { useCallback, useEffect, useRef, useState } from 'react'
import { useLatest } from '../utils/useLatest'

export interface UsePollingOptions<T> {
  /** start automatically. default true */
  enabled?: boolean
  /** call immediately (not after the first interval). default true */
  immediate?: boolean
  /** stop polling when this returns true */
  stopWhen?: (result: T) => boolean
  /** pause while the tab is hidden. default true */
  pauseWhenHidden?: boolean
  onError?: (e: Error) => void
}

/**
 * Calls an async function every `interval` ms – next call starts only after the previous finished.
 * @example const { data, stop, start, isPolling } = usePolling(() => api.status(id), 2000, { stopWhen: r => r.done })
 */
export function usePolling<T>(fn: () => Promise<T>, interval: number, { enabled = true, immediate = true, stopWhen, pauseWhenHidden = true, onError }: UsePollingOptions<T> = {}) {
  const fnRef = useLatest(fn)
  const optsRef = useLatest({ stopWhen, onError })
  const [data, setData] = useState<T | undefined>()
  const [error, setError] = useState<Error | null>(null)
  const [isPolling, setPolling] = useState(enabled)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const poll = useCallback(async () => {
    try {
      const r = await fnRef.current()
      setData(r)
      setError(null)
      if (optsRef.current.stopWhen?.(r)) return false
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      optsRef.current.onError?.(err)
    }
    return true
  }, [fnRef, optsRef])

  useEffect(() => {
    if (!isPolling) return
    let alive = true
    const loop = async (first: boolean) => {
      if (!alive) return
      if (!(first && !immediate) && !(pauseWhenHidden && document.hidden)) {
        if (!(await poll())) return alive && setPolling(false)
      }
      if (alive) timer.current = setTimeout(() => loop(false), interval)
    }
    void loop(true)
    return () => {
      alive = false
      clearTimeout(timer.current)
    }
  }, [isPolling, interval, immediate, pauseWhenHidden, poll])

  useEffect(() => setPolling(enabled), [enabled])

  return { data, error, isPolling, start: useCallback(() => setPolling(true), []), stop: useCallback(() => setPolling(false), []), pollNow: poll }
}
