import { useCallback, useMemo, useState } from 'react'

export interface UseBooleanReturn {
  value: boolean
  setTrue: () => void
  setFalse: () => void
  toggle: () => void
  set: (value: boolean) => void
}

/**
 * Boolean state with explicit helpers.
 * @example
 * const modal = useBoolean(false)
 * <button onClick={modal.setTrue}>Open</button>
 */
export function useBoolean(initial = false): UseBooleanReturn {
  const [value, set] = useState(initial)
  const setTrue = useCallback(() => set(true), [])
  const setFalse = useCallback(() => set(false), [])
  const toggle = useCallback(() => set((v) => !v), [])
  return useMemo(() => ({ value, setTrue, setFalse, toggle, set }), [value, setTrue, setFalse, toggle])
}
