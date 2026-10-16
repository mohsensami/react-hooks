import { useMemo, useState } from 'react'

/**
 * `Set` state – every change creates a new Set.
 * @example const [set, { add, remove, toggle, has }] = useSet<number>([1, 2])
 */
export function useSet<T>(initial: Iterable<T> = []) {
  const [values] = useState(() => Array.from(initial))
  const [set, setSet] = useState(() => new Set<T>(values))

  const actions = useMemo(
    () => ({
      add: (item: T) => setSet((s) => (s.has(item) ? s : new Set(s).add(item))),
      remove: (item: T) =>
        setSet((s) => {
          if (!s.has(item)) return s
          const next = new Set(s)
          next.delete(item)
          return next
        }),
      toggle: (item: T) =>
        setSet((s) => {
          const next = new Set(s)
          if (next.has(item)) next.delete(item)
          else next.add(item)
          return next
        }),
      has: (item: T) => set.has(item),
      clear: () => setSet(new Set()),
      reset: () => setSet(new Set(values)),
      set: (items: Iterable<T>) => setSet(new Set(items)),
    }),
    [set, values],
  )
  return [set, actions] as const
}
