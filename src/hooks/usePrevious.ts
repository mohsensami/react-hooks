import { useEffect, useRef } from 'react'

/**
 * Returns the value from the previous render (`undefined` on first render).
 * @example
 * const prev = usePrevious(count) // count was `prev` before
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}
