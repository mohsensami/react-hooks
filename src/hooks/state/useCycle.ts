import { useCallback, useState } from 'react'

/**
 * Cycles through a list of values (wraps around).
 * @example const { value, next, prev } = useCycle(['light', 'dark', 'system'])
 */
export function useCycle<T>(values: readonly T[], initialIndex = 0) {
  const [index, setIndex] = useState(initialIndex)
  const next = useCallback(() => setIndex((i) => (i + 1) % values.length), [values.length])
  const prev = useCallback(() => setIndex((i) => (i - 1 + values.length) % values.length), [values.length])
  const setValue = useCallback((v: T) => setIndex(Math.max(0, values.indexOf(v))), [values])
  return { value: values[index], index, next, prev, setIndex, setValue }
}
