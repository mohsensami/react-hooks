import { useRef } from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

/**
 * Returns a ref that always holds the latest value. Useful to read fresh
 * props/state inside timers, listeners or async callbacks without re-subscribing.
 * @example
 * const countRef = useLatest(count)
 * setInterval(() => console.log(countRef.current), 1000)
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value)
  useIsomorphicLayoutEffect(() => {
    ref.current = value
  })
  return ref
}
