import { useMemo, useRef, useState } from 'react'
import { resolveSetter } from '../_internal'
import type { Setter } from '../_internal'

/**
 * Array state with immutable helpers.
 * @example const [list, { push, removeAt, update, move, clear }] = useArray<string>(['a'])
 */
export function useArray<T>(initial: T[] | (() => T[]) = []) {
  const [array, setArray] = useState<T[]>(initial)
  const initialRef = useRef(array)

  const actions = useMemo(
    () => ({
      set: setArray,
      push: (...items: T[]) => setArray((a) => [...a, ...items]),
      unshift: (...items: T[]) => setArray((a) => [...items, ...a]),
      pop: () => setArray((a) => a.slice(0, -1)),
      shift: () => setArray((a) => a.slice(1)),
      insert: (index: number, ...items: T[]) => setArray((a) => [...a.slice(0, index), ...items, ...a.slice(index)]),
      update: (index: number, value: Setter<T>) =>
        setArray((a) => a.map((x, i) => (i === index ? resolveSetter(value, x) : x))),
      removeAt: (index: number) => setArray((a) => a.filter((_, i) => i !== index)),
      remove: (predicate: (item: T, index: number) => boolean) => setArray((a) => a.filter((x, i) => !predicate(x, i))),
      filter: (predicate: (item: T, index: number) => boolean) => setArray((a) => a.filter(predicate)),
      map: (fn: (item: T, index: number) => T) => setArray((a) => a.map(fn)),
      move: (from: number, to: number) =>
        setArray((a) => {
          if (from < 0 || from >= a.length) return a
          const copy = [...a]
          const [item] = copy.splice(from, 1)
          copy.splice(to, 0, item)
          return copy
        }),
      swap: (i: number, j: number) =>
        setArray((a) => {
          if (i >= a.length || j >= a.length) return a
          const copy = [...a]
          ;[copy[i], copy[j]] = [copy[j], copy[i]]
          return copy
        }),
      sort: (compare?: (a: T, b: T) => number) => setArray((a) => [...a].sort(compare)),
      reverse: () => setArray((a) => [...a].reverse()),
      clear: () => setArray([]),
      reset: () => setArray(initialRef.current),
    }),
    [],
  )
  return [array, actions] as const
}
