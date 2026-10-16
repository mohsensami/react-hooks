import { useCallback, useMemo, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

/**
 * Sort an array of objects by a key; click the same key again to flip direction.
 * @example const { sorted, sortKey, direction, toggleSort } = useSort(users, { key: 'name' })
 */
export function useSort<T extends Record<string, unknown>>(
  items: T[],
  { key: initialKey = null as keyof T | null, direction: initialDir = 'asc' as SortDirection, compare }: { key?: keyof T | null; direction?: SortDirection; compare?: (a: T, b: T, key: keyof T) => number } = {},
) {
  const [sortKey, setSortKey] = useState<keyof T | null>(initialKey)
  const [direction, setDirection] = useState<SortDirection>(initialDir)

  const toggleSort = useCallback(
    (key: keyof T) => {
      if (key === sortKey) setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
      else {
        setSortKey(key)
        setDirection('asc')
      }
    },
    [sortKey],
  )

  const sorted = useMemo(() => {
    if (sortKey === null) return items
    const mul = direction === 'asc' ? 1 : -1
    const base =
      compare ??
      ((a: T, b: T, k: keyof T) => {
        const x = a[k]
        const y = b[k]
        if (typeof x === 'number' && typeof y === 'number') return x - y
        return String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true, sensitivity: 'base' })
      })
    return [...items].sort((a, b) => mul * base(a, b, sortKey))
  }, [items, sortKey, direction, compare])

  return { sorted, sortKey, direction, toggleSort, setSort: (k: keyof T | null, d: SortDirection = 'asc') => { setSortKey(k); setDirection(d) } }
}
