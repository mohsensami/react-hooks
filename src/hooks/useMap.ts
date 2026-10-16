import { useMemo, useState } from 'react'

/**
 * Immutable `Map` state.
 * @example
 * const [map, { set, remove, clear, reset, setAll }] = useMap<string, number>([['a', 1]])
 */
export function useMap<K, V>(initial: Iterable<readonly [K, V]> = []) {
  const [map, setMap] = useState(() => new Map<K, V>(initial))
  const actions = useMemo(
    () => ({
      set: (key: K, value: V) => setMap((m) => new Map(m).set(key, value)),
      setAll: (entries: Iterable<readonly [K, V]>) => setMap(new Map(entries)),
      remove: (key: K) =>
        setMap((m) => {
          if (!m.has(key)) return m
          const n = new Map(m)
          n.delete(key)
          return n
        }),
      update: (key: K, fn: (prev: V | undefined) => V) => setMap((m) => new Map(m).set(key, fn(m.get(key)))),
      clear: () => setMap(new Map()),
      reset: () => setMap(new Map(initial)),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  return [map, actions] as const
}
