import { useCallback, useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface UseSortOptions<T> {
  key?: keyof T;
  direction?: SortDirection;
}

export interface UseSortReturn<T> {
  sorted: T[];
  sortKey: keyof T | null;
  direction: SortDirection | null;
  /** Click-style sorting: asc -> desc -> none (for the same key) */
  requestSort: (key: keyof T) => void;
  setSort: (key: keyof T, direction: SortDirection) => void;
  clearSort: () => void;
  /** Direction applied to a given column (for arrow icons) */
  getDirection: (key: keyof T) => SortDirection | null;
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Sortable table / list data (numbers, strings, dates, booleans, null last).
 *
 * @example
 * const { sorted, requestSort, getDirection } = useSort(users, { key: 'name' });
 * <th onClick={() => requestSort('age')}>Age {getDirection('age')}</th>
 */
export function useSort<T extends object>(
  items: readonly T[],
  options: UseSortOptions<T> = {},
): UseSortReturn<T> {
  const [sortKey, setSortKey] = useState<keyof T | null>(options.key ?? null);
  const [direction, setDirection] = useState<SortDirection | null>(
    options.key ? (options.direction ?? 'asc') : null,
  );

  const sorted = useMemo(() => {
    if (sortKey === null || direction === null) return [...items];
    const factor = direction === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => factor * compareValues(a[sortKey], b[sortKey]));
  }, [items, sortKey, direction]);

  const requestSort = useCallback(
    (key: keyof T) => {
      if (sortKey !== key) {
        setSortKey(key);
        setDirection('asc');
      } else if (direction === 'asc') {
        setDirection('desc');
      } else {
        setSortKey(null);
        setDirection(null);
      }
    },
    [sortKey, direction],
  );

  const setSort = useCallback((key: keyof T, dir: SortDirection) => {
    setSortKey(key);
    setDirection(dir);
  }, []);

  const clearSort = useCallback(() => {
    setSortKey(null);
    setDirection(null);
  }, []);

  const getDirection = useCallback(
    (key: keyof T) => (sortKey === key ? direction : null),
    [sortKey, direction],
  );

  return { sorted, sortKey, direction, requestSort, setSort, clearSort, getDirection };
}
