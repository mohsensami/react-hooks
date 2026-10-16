import { useMemo, useState } from 'react';

export interface UseListActions<T> {
  set: (list: T[]) => void;
  push: (...items: T[]) => void;
  unshift: (...items: T[]) => void;
  insertAt: (index: number, item: T) => void;
  updateAt: (index: number, item: T) => void;
  removeAt: (index: number) => void;
  removeWhere: (predicate: (item: T, index: number) => boolean) => void;
  move: (from: number, to: number) => void;
  swap: (a: number, b: number) => void;
  sort: (compareFn?: (a: T, b: T) => number) => void;
  reverse: () => void;
  clear: () => void;
  reset: () => void;
}

/**
 * Array state with every common (immutable) list operation.
 *
 * @example
 * const [todos, { push, removeAt, move }] = useList<string>(['a', 'b']);
 */
export function useList<T>(initialList: readonly T[] = []): [T[], UseListActions<T>] {
  const [initial] = useState<readonly T[]>(initialList);
  const [list, setList] = useState<T[]>(() => [...initial]);

  const actions = useMemo<UseListActions<T>>(
    () => ({
      set: (next) => setList(next),
      push: (...items) => setList((prev) => [...prev, ...items]),
      unshift: (...items) => setList((prev) => [...items, ...prev]),
      insertAt: (index, item) =>
        setList((prev) => {
          const next = [...prev];
          next.splice(index, 0, item);
          return next;
        }),
      updateAt: (index, item) =>
        setList((prev) => {
          if (index < 0 || index >= prev.length) return prev;
          const next = [...prev];
          next[index] = item;
          return next;
        }),
      removeAt: (index) => setList((prev) => prev.filter((_, i) => i !== index)),
      removeWhere: (predicate) => setList((prev) => prev.filter((item, i) => !predicate(item, i))),
      move: (from, to) =>
        setList((prev) => {
          if (from < 0 || from >= prev.length || to < 0 || to >= prev.length) return prev;
          const next = [...prev];
          const [item] = next.splice(from, 1);
          next.splice(to, 0, item as T);
          return next;
        }),
      swap: (a, b) =>
        setList((prev) => {
          if (a < 0 || b < 0 || a >= prev.length || b >= prev.length) return prev;
          const next = [...prev];
          [next[a], next[b]] = [next[b] as T, next[a] as T];
          return next;
        }),
      sort: (compareFn) => setList((prev) => [...prev].sort(compareFn)),
      reverse: () => setList((prev) => [...prev].reverse()),
      clear: () => setList([]),
      reset: () => setList([...initial]),
    }),
    [initial],
  );

  return [list, actions];
}
