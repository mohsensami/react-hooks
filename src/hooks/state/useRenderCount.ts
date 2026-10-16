import { useRef } from 'react'

/** How many times the component has rendered (handy for debugging). In StrictMode dev it counts double. */
export function useRenderCount(): number {
  const count = useRef(0)
  count.current += 1
  return count.current
}
