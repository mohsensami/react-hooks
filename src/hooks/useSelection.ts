import { useCallback, useMemo, useState } from 'react'

export interface UseSelectionOptions<T> {
  /** allow selecting several items (default true) */
  multiple?: boolean
  /** how to identify an item (default: the item itself) */
  getKey?: (item: T) => unknown
  initial?: T[]
}

/**
 * Selection logic for lists/tables (checkboxes, select all, indeterminate...).
 * @example
 * const sel = useSelection(users, { getKey: (u) => u.id })
 * <input type="checkbox" checked={sel.isSelected(u)} onChange={() => sel.toggle(u)} />
 */
export function useSelection<T>(items: T[], { multiple = true, getKey = (i: T) => i, initial = [] }: UseSelectionOptions<T> = {}) {
  const [keys, setKeys] = useState<unknown[]>(() => initial.map(getKey))
  const isSelected = useCallback((item: T) => keys.includes(getKey(item)), [keys, getKey])
  const select = useCallback(
    (item: T) => setKeys((k) => (multiple ? (k.includes(getKey(item)) ? k : [...k, getKey(item)]) : [getKey(item)])),
    [multiple, getKey],
  )
  const deselect = useCallback((item: T) => setKeys((k) => k.filter((x) => x !== getKey(item))), [getKey])
  const toggle = useCallback(
    (item: T) => (keys.includes(getKey(item)) ? deselect(item) : select(item)),
    [keys, getKey, deselect, select],
  )
  const clear = useCallback(() => setKeys([]), [])
  const selectAll = useCallback(() => multiple && setKeys(items.map(getKey)), [multiple, items, getKey])
  const toggleAll = useCallback(() => {
    if (keys.length === items.length) clear()
    else selectAll()
  }, [keys.length, items.length, clear, selectAll])
  const selected = useMemo(() => items.filter((i) => keys.includes(getKey(i))), [items, keys, getKey])
  return {
    selected,
    isSelected,
    select,
    deselect,
    toggle,
    toggleAll,
    selectAll,
    clear,
    isAllSelected: items.length > 0 && selected.length === items.length,
    isIndeterminate: selected.length > 0 && selected.length < items.length,
  }
}
