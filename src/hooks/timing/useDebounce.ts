import { useEffect, useState } from 'react'

/**
 * Debounced copy of `value` – updates only after `delay` ms of no changes.
 * @example const debounced = useDebounce(search, 400)
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

/**
 * useState + debounced value in one.
 * @example const [value, debounced, setValue] = useDebouncedState('', 300)
 */
export function useDebouncedState<T>(initial: T, delay = 300) {
  const [value, setValue] = useState(initial)
  const debounced = useDebounce(value, delay)
  return [value, debounced, setValue] as const
}
