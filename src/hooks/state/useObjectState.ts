import { useCallback, useRef, useState } from 'react'

/**
 * Object state with *partial* updates (like class `this.setState`).
 * @example const [state, patch, reset] = useObjectState({ name: '', age: 0 }); patch({ age: 20 })
 */
export function useObjectState<T extends object>(initial: T | (() => T)) {
  const [state, setState] = useState<T>(initial)
  const initialRef = useRef(state)
  const patch = useCallback((p: Partial<T> | ((prev: T) => Partial<T>)) => {
    setState((prev) => ({ ...prev, ...(typeof p === 'function' ? (p as (prev: T) => Partial<T>)(prev) : p) }))
  }, [])
  const reset = useCallback(() => setState(initialRef.current), [])
  return [state, patch, reset, setState] as const
}
