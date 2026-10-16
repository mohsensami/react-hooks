import { useRef } from 'react'

/** `true` only during the very first render. */
export function useIsFirstRender(): boolean {
  const first = useRef(true)
  if (first.current) {
    first.current = false
    return true
  }
  return first.current
}
