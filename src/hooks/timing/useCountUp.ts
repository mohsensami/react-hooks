import { useEffect, useRef, useState } from 'react'

export interface UseCountUpOptions {
  start?: number
  /** animation length in ms, default 1000 */
  duration?: number
  decimals?: number
  enabled?: boolean
  easing?: (t: number) => number
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Animates a number up/down to `end` (restarts from the current value when `end` changes).
 * @example const n = useCountUp(1234, { duration: 1500 })
 */
export function useCountUp(end: number, { start = 0, duration = 1000, decimals = 0, enabled = true, easing = easeOutCubic }: UseCountUpOptions = {}) {
  const [value, setValue] = useState(start)
  const current = useRef(start)
  useEffect(() => {
    if (!enabled) return
    const from = current.current
    const t0 = performance.now()
    let id = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration)
      const v = from + (end - from) * easing(p)
      current.current = v
      setValue(Number(v.toFixed(decimals)))
      if (p < 1) id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [end, duration, decimals, enabled, easing])
  return value
}
