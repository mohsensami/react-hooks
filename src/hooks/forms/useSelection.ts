import { useCallback, useMemo, useState } from 'react'

/**
 * Select items in a list (checkbox list, table rows). `multiple: false` = radio behaviour.
 * @example const sel = useSelection(users, { getKey: u => u.id }); sel.toggle(user); sel.isSelected(user)
 */
export function useSelection<T>(items: T[], { getKey = (i: T) => i as unknown, multiple = true, initialSelected = [] as T[] } = {}) {
  const [keys, setKeys] = useState<Set<unknown>>(() => new Set(initialSelected.map(getKey)))

  const isSelected = useCallback((item: T) => keys.has(getKey(item)), [keys, getKey])
  const toggle = useCallback(
    (item: T) =>
      setKeys((prev) => {
        const k = getKey(item)
        if (!multiple) return prev.has(k) ? new Set() : new Set([k])
        const next = new Set(prev)
        if (next.has(k)) next.delete(k)
        else next.add(k)
        return next
      }),
    [getKey, multiple],
  )
  const select = useCallback((item: T) => setKeys((p) => (multiple ? new Set(p).add(getKey(item)) : new Set([getKey(item)]))), [getKey, multiple])
  const deselect = useCallback((item: T) => setKeys((p) => { const n = new Set(p); n.delete(getKey(item)); return n }), [getKey])
  const selectAll = useCallback(() => multiple && setKeys(new Set(items.map(getKey))), [items, getKey, multiple])
  const clear = useCallback(() => setKeys(new Set()), [])

  const selected = useMemo(() => items.filter((i) => keys.has(getKey(i))), [items, keys, getKey])
  const isAllSelected = items.length > 0 && selected.length === items.length
  const toggleAll = useCallback(() => (isAllSelected ? clear() : selectAll()), [isAllSelected, clear, selectAll])

  return { selected, count: selected.length, isSelected, toggle, select, deselect, selectAll, toggleAll, clear, isAllSelected, isPartiallySelected: selected.length > 0 && !isAllSelected }
}
