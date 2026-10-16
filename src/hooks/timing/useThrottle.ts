import { useEffect, useRef, useState } from 'react'
import type { AnyFn } from '../_internal'
import { useDebouncedCallback } from './useDebouncedCallback'
import type { DebouncedFn } from './useDebouncedCallback'

/**
 * Throttled copy of `value` – updates at most once per `interval` ms.
 * @example const y = useThrottle(scrollY, 100)
 */
export function useThrottle<T>(value: T, interval = 300): T {
  const [throttled, setThrottled] = useState(value)
  const last = useRef(0)
  useEffect(() => {
    const remaining = interval - (Date.now() - last.current)
    if (remaining <= 0) {
      last.current = Date.now()
      setThrottled(value)
      return
    }
    const id = setTimeout(() => {
      last.current = Date.now()
      setThrottled(value)
    }, remaining)
    return () => clearTimeout(id)
  }, [value, interval])
  return throttled
}

/**
 * Throttled callback – runs at most once per `interval` ms.
 * @example const onScroll = useThrottledCallback(() => {...}, 200)
 */
export function useThrottledCallback<T extends AnyFn>(
  fn: T,
  interval = 300,
  { leading = true, trailing = true }: { leading?: boolean; trailing?: boolean } = {},
): DebouncedFn<T> {
  return useDebouncedCallback(fn, interval, { leading, trailing, maxWait: interval })
}
