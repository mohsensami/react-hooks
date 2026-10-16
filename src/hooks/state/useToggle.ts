import { useCallback, useState } from 'react'

/**
 * Boolean toggle. `toggle()` flips, `toggle(true)` forces a value.
 * Safe to pass directly as onClick (non-boolean args are ignored).
 * @example const [open, toggleOpen, setOpen] = useToggle(false)
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback((next?: unknown) => {
    setValue((prev) => (typeof next === 'boolean' ? next : !prev))
  }, [])
  return [value, toggle, setValue] as const
}
