import { useMemo, useState } from 'react'

/**
 * `Map` state – every change creates a new Map so React re-renders.
 * @example const [map, { set, remove, clear }] = useMap<string, number>([['a', 1]])
 */
export function useMap<K, V>(initial: Iterable<readonly [K, V]> = []) {
  const [entries] = useState(() => Array.from(initial))
  const [map, setMap] = useState(() => new Map<K, V>(entries))

  const actions = useMemo(
    () => ({
      set: (key: K, value: V) => setMap((m) => new Map(m).set(key, value)),
      setAll: (items: Iterable<readonly [K, V]>) => setMap(new Map(items)),
      merge: (items: Iterable<readonly [K, V]>) =>
        setMap((m) => {
          const next = new Map(m)
          for (const [k, v] of items) next.set(k, v)
          return next
        }),
      remove: (key: K) =>
        setMap((m) => {
          if (!m.has(key)) return m
          const next = new Map(m)
          next.delete(key)
          return next
        }),
      clear: () => setMap(new Map()),
      reset: () => setMap(new Map(entries)),
    }),
    [entries],
  )
  return [map, actions] as const
}
