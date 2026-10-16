import { useCallback, useEffect, useRef } from 'react'

/** Returns `() => boolean` telling whether the component is still mounted (avoid setState after unmount). */
export function useIsMounted(): () => boolean {
  const ref = useRef(false)
  useEffect(() => {
    ref.current = true
    return () => {
      ref.current = false
    }
  }, [])
  return useCallback(() => ref.current, [])
}
