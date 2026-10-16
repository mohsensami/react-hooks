import { useEffect } from 'react'
import { useLatest } from '../utils/useLatest'

/**
 * Declarative `setInterval`. Pass `null` as delay to pause.
 * @example useInterval(() => setTick(t => t + 1), running ? 1000 : null)
 */
export function useInterval(callback: () => void, delay: number | null, { immediate = false } = {}) {
  const cbRef = useLatest(callback)
  useEffect(() => {
    if (delay === null) return
    if (immediate) cbRef.current()
    const id = setInterval(() => cbRef.current(), delay)
    return () => clearInterval(id)
  }, [delay, immediate, cbRef])
}
