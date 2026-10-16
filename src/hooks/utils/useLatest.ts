import { useRef } from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

/**
 * Always holds the latest value in a ref – read it from timers / listeners
 * without re-subscribing.
 * @example const cbRef = useLatest(callback); setTimeout(() => cbRef.current(), 100)
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value)
  useIsomorphicLayoutEffect(() => {
    ref.current = value
  })
  return ref
}
