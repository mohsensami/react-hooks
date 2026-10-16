import { useCallback, useState } from 'react'
import { resolveSetter } from '../_internal'
import type { Setter } from '../_internal'

export interface UseCounterOptions {
  min?: number
  max?: number
  step?: number
}

/**
 * Number counter clamped between `min` and `max`.
 * @example const { count, increment, decrement, reset, set } = useCounter(0, { min: 0, max: 10, step: 2 })
 */
export function useCounter(initialValue = 0, { min = -Infinity, max = Infinity, step = 1 }: UseCounterOptions = {}) {
  const clamp = useCallback((n: number) => Math.min(max, Math.max(min, n)), [min, max])
  const [count, setCount] = useState(() => clamp(initialValue))

  const set = useCallback((value: Setter<number>) => setCount((p) => clamp(resolveSetter(value, p))), [clamp])
  const increment = useCallback((by?: number) => set((p) => p + (typeof by === 'number' ? by : step)), [set, step])
  const decrement = useCallback((by?: number) => set((p) => p - (typeof by === 'number' ? by : step)), [set, step])
  const reset = useCallback(() => set(initialValue), [set, initialValue])

  return { count, increment, decrement, reset, set }
}
