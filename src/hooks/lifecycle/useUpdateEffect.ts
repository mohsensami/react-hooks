import { useEffect, useRef } from 'react'
import type { DependencyList, EffectCallback } from 'react'

/** Like `useEffect` but skips the first run (mount). StrictMode-safe. */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
  const mounted = useRef(false)
  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    return effect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
