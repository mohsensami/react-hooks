import { useEffect, useRef } from 'react'

/**
 * Returns the previous value as long as `compare(prev, next)` is true –
 * keeps object identity stable for effect deps.
 */
export function useMemoCompare<T>(next: T, compare: (prev: T | undefined, next: T) => boolean): T {
  const ref = useRef<T | undefined>(undefined)
  const prev = ref.current
  const isEqual = compare(prev, next)
  useEffect(() => {
    if (!isEqual) ref.current = next
  })
  return isEqual ? (prev as T) : next
}
