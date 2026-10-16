import { useMemo, useState } from 'react'

/**
 * Array state with a full set of immutable helpers.
 * @example
 * const { value, push, removeAt, update, move, swap, clear } = useArray([1, 2, 3])
 */
export function useArray<T>(initial: T[] = []) {
  const [value, setValue] = useState<T[]>(initial)
  const actions = useMemo(
    () => ({
      set: setValue,
      push: (...items: T[]) => setValue((a) => [...a, ...items]),
      unshift: (...items: T[]) => setValue((a) => [...items, ...a]),
      pop: () => setValue((a) => a.slice(0, -1)),
      shift: () => setValue((a) => a.slice(1)),
      insert: (index: number, ...items: T[]) =>
        setValue((a) => [...a.slice(0, index), ...items, ...a.slice(index)]),
      removeAt: (index: number) => setValue((a) => a.filter((_, i) => i !== index)),
      remove: (predicate: (item: T, index: number) => boolean) =>
        setValue((a) => a.filter((item, i) => !predicate(item, i))),
      update: (index: number, item: T | ((prev: T) => T)) =>
        setValue((a) =>
          a.map((x, i) => (i === index ? (typeof item === 'function' ? (item as (p: T) => T)(x) : item) : x)),
        ),
      filter: (predicate: (item: T, index: number) => boolean) => setValue((a) => a.filter(predicate)),
      map: (fn: (item: T, index: number) => T) => setValue((a) => a.map(fn)),
      sort: (compare?: (a: T, b: T) => number) => setValue((a) => [...a].sort(compare)),
      reverse: () => setValue((a) => [...a].reverse()),
      move: (from: number, to: number) =>
        setValue((a) => {
          const n = [...a]
          const [item] = n.splice(from, 1)
          n.splice(to, 0, item)
          return n
        }),
      swap: (i: number, j: number) =>
        setValue((a) => {
          const n = [...a]
          ;[n[i], n[j]] = [n[j], n[i]]
          return n
        }),
      clear: () => setValue([]),
      reset: () => setValue(initial),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  return { value, ...actions }
}
