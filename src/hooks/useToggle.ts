import { useCallback, useState } from 'react'

/**
 * Boolean state with a toggle function. `toggle()` flips, `toggle(true|false)` sets.
 * Safe to pass directly to `onClick` (non-boolean args are ignored).
 * @example
 * const [open, toggleOpen] = useToggle(false)
 * <button onClick={toggleOpen}>{open ? 'Close' : 'Open'}</button>
 */
export function useToggle(initial = false): [boolean, (value?: unknown) => void] {
  const [state, setState] = useState(initial)
  const toggle = useCallback((value?: unknown) => {
    setState((prev) => (typeof value === 'boolean' ? value : !prev))
  }, [])
  return [state, toggle]
}
