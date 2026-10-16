import { useOptimistic, useTransition } from 'react';

type OptimisticAction<T> =
  | { type: 'add'; item: T }
  | { type: 'remove'; key: string | number }
  | { type: 'update'; key: string | number; patch: Partial<T> };

export interface UseOptimisticListOptions<T> {
  /** Unique key of an item */
  getKey: (item: T) => string | number;
  /** Where optimistic items are inserted (default: 'end') */
  position?: 'start' | 'end';
}

export interface UseOptimisticListReturn<T> {
  /** The list to render: real items + pending optimistic changes */
  items: readonly T[];
  /** `true` while an optimistic action is still being committed */
  isPending: boolean;
  /** Optimistically add an item, then run `commit` (e.g. the server request) */
  add: (item: T, commit?: () => Promise<unknown> | unknown) => void;
  /** Optimistically remove an item by key */
  remove: (key: string | number, commit?: () => Promise<unknown> | unknown) => void;
  /** Optimistically patch an item by key */
  update: (
    key: string | number,
    patch: Partial<T>,
    commit?: () => Promise<unknown> | unknown,
  ) => void;
}

/**
 * React 19 `useOptimistic` + `useTransition` wrapped as a list helper.
 * The optimistic change is shown immediately and automatically rolled back
 * to the real `items` once `commit` finishes — so inside `commit` you must
 * update your real source of truth (state / query cache).
 *
 * @example
 * const { items, add } = useOptimisticList(todos, { getKey: (t) => t.id });
 * add({ id: 'tmp', title: 'Buy milk' }, async () => {
 *   const saved = await api.create('Buy milk');
 *   setTodos((prev) => [...prev, saved]);
 * });
 */
export function useOptimisticList<T>(
  list: readonly T[],
  options: UseOptimisticListOptions<T>,
): UseOptimisticListReturn<T> {
  const { getKey, position = 'end' } = options;
  const [isPending, startTransition] = useTransition();

  const [items, dispatch] = useOptimistic<readonly T[], OptimisticAction<T>>(list, (state, action) => {
    switch (action.type) {
      case 'add':
        return position === 'start' ? [action.item, ...state] : [...state, action.item];
      case 'remove':
        return state.filter((item) => getKey(item) !== action.key);
      case 'update':
        return state.map((item) =>
          getKey(item) === action.key ? { ...item, ...action.patch } : item,
        );
    }
  });

  const run = (action: OptimisticAction<T>, commit?: () => Promise<unknown> | unknown) => {
    startTransition(async () => {
      dispatch(action);
      if (commit) await commit();
    });
  };

  return {
    items,
    isPending,
    add: (item, commit) => run({ type: 'add', item }, commit),
    remove: (key, commit) => run({ type: 'remove', key }, commit),
    update: (key, patch, commit) => run({ type: 'update', key, patch }, commit),
  };
}
