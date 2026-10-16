import { useCallback, useMemo, useState } from 'react'

/**
 * Immutable `Set` state. Every mutation creates a new Set (re-render safe).
 * @example
 * const [tags, { add, remove, toggle, has, clear, reset }] = useSet<string>(['a'])
 */
export function useSet<T>(initial: Iterable<T> = []) {
  const [set, setSet] = useState(() => new Set(initial))
  const actions = useMemo(
    () => ({
      add: (item: T) => setSet((s) => (s.has(item) ? s : new Set(s).add(item))),
      remove: (item: T) =>
        setSet((s) => {
          if (!s.has(item)) return s
          const n = new Set(s)
          n.delete(item)
          return n
        }),
      toggle: (item: T) =>
        setSet((s) => {
          const n = new Set(s)
          if (n.has(item)) n.delete(item)
          else n.add(item)
          return n
        }),
      clear: () => setSet(new Set()),
      reset: () => setSet(new Set(initial)),
      set: (items: Iterable<T>) => setSet(new Set(items)),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const has = useCallback((item: T) => set.has(item), [set])
  return [set, { ...actions, has }] as const
}
