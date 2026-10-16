import { useRef } from 'react'

/** Computes `init()` once (lazy) and returns the same value for the component's lifetime. */
export function useConst<T>(init: () => T): T {
  const ref = useRef<{ value: T } | null>(null)
  if (ref.current === null) ref.current = { value: init() }
  return ref.current.value
}
