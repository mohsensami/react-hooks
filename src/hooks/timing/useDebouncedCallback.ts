import { useEffect, useMemo, useRef } from 'react'
import type { AnyFn } from '../_internal'
import { useLatest } from '../utils/useLatest'

export interface DebounceOptions {
  /** Call on the leading edge. default false */
  leading?: boolean
  /** Call on the trailing edge. default true */
  trailing?: boolean
  /** Max time (ms) the call may be delayed. */
  maxWait?: number
}

export interface DebouncedFn<T extends AnyFn> {
  (...args: Parameters<T>): void
  /** Drop the pending call. */
  cancel: () => void
  /** Run the pending call right now. */
  flush: () => void
  /** Is a call waiting? */
  isPending: () => boolean
}

type Timer = ReturnType<typeof setTimeout> | undefined

/**
 * Debounced version of a callback (stable identity, cancels on unmount).
 * @example const search = useDebouncedCallback((q: string) => api(q), 400); <input onChange={e => search(e.target.value)} />
 */
export function useDebouncedCallback<T extends AnyFn>(
  fn: T,
  delay = 300,
  { leading = false, trailing = true, maxWait }: DebounceOptions = {},
): DebouncedFn<T> {
  const fnRef = useLatest(fn)
  const timer = useRef<Timer>(undefined)
  const maxTimer = useRef<Timer>(undefined)
  const lastArgs = useRef<Parameters<T> | null>(null)

  const debounced = useMemo(() => {
    const clearAll = () => {
      clearTimeout(timer.current)
      clearTimeout(maxTimer.current)
      timer.current = undefined
      maxTimer.current = undefined
    }
    const invokePending = () => {
      const args = lastArgs.current
      lastArgs.current = null
      if (args) fnRef.current(...args)
    }
    const d = (...args: Parameters<T>) => {
      const idle = timer.current === undefined
      if (idle && leading) {
        lastArgs.current = null
        fnRef.current(...args)
      } else {
        lastArgs.current = args
      }
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        clearAll()
        if (trailing) invokePending()
        else lastArgs.current = null
      }, delay)
      if (maxWait !== undefined && maxTimer.current === undefined) {
        maxTimer.current = setTimeout(() => {
          maxTimer.current = undefined
          invokePending()
        }, maxWait)
      }
    }
    return Object.assign(d, {
      cancel: () => {
        clearAll()
        lastArgs.current = null
      },
      flush: () => {
        clearAll()
        invokePending()
      },
      isPending: () => timer.current !== undefined,
    }) as DebouncedFn<T>
  }, [delay, leading, trailing, maxWait, fnRef])

  useEffect(() => () => debounced.cancel(), [debounced])
  return debounced
}
