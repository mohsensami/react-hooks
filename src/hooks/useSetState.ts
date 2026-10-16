import { useCallback, useState } from 'react'

/**
 * Object state with *merge* semantics (like class component `setState`).
 * @example
 * const [state, setState, reset] = useSetState({ name: '', age: 0 })
 * setState({ age: 20 })                  // merges
 * setState((prev) => ({ age: prev.age + 1 }))
 */
export function useSetState<T extends object>(initial: T) {
  const [state, set] = useState<T>(initial)
  const setState = useCallback(
    (patch: Partial<T> | ((prev: T) => Partial<T>)) =>
      set((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) })),
    [],
  )
  const reset = useCallback(() => set(initial), [initial])
  return [state, setState, reset] as const
}
