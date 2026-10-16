import { useCallback, useState } from 'react'
import { clamp } from './utils'

export interface UseCounterOptions {
  min?: number
  max?: number
  step?: number
}

/**
 * Number counter with optional min/max clamp and step.
 * @example
 * const { count, inc, dec, set, reset } = useCounter(0, { min: 0, max: 10 })
 */
export function useCounter(initial = 0, { min = -Infinity, max = Infinity, step = 1 }: UseCounterOptions = {}) {
  const [count, setCount] = useState(() => clamp(initial, min, max))
  const inc = useCallback((by = step) => setCount((c) => clamp(c + by, min, max)), [step, min, max])
  const dec = useCallback((by = step) => setCount((c) => clamp(c - by, min, max)), [step, min, max])
  const set = useCallback(
    (value: number | ((prev: number) => number)) =>
      setCount((c) => clamp(typeof value === 'function' ? value(c) : value, min, max)),
    [min, max],
  )
  const reset = useCallback(() => setCount(clamp(initial, min, max)), [initial, min, max])
  return { count, inc, dec, set, reset }
}
