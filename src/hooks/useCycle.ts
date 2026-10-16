import { useCallback, useState } from 'react';

export interface UseCycleReturn<T> {
  value: T;
  index: number;
  next: () => void;
  prev: () => void;
  setIndex: (index: number) => void;
  /** Jump to a specific value (no-op when the value is not in the list). */
  set: (value: T) => void;
}

/**
 * Cycles through a list of values (theme: light -> dark -> system -> light ...).
 *
 * @example
 * const { value: theme, next } = useCycle(['light', 'dark', 'system'] as const);
 */
export function useCycle<T>(values: readonly T[], initialIndex = 0): UseCycleReturn<T> {
  const length = values.length;
  const [index, setIndexState] = useState(initialIndex);

  const safeIndex = length === 0 ? 0 : ((index % length) + length) % length;

  const next = useCallback(
    () => setIndexState((i) => (length === 0 ? 0 : (i + 1) % length)),
    [length],
  );
  const prev = useCallback(
    () => setIndexState((i) => (length === 0 ? 0 : (i - 1 + length) % length)),
    [length],
  );
  const setIndex = useCallback(
    (i: number) => setIndexState(length === 0 ? 0 : ((i % length) + length) % length),
    [length],
  );
  const set = useCallback(
    (value: T) => {
      const found = values.indexOf(value);
      if (found !== -1) setIndexState(found);
    },
    [values],
  );

  return { value: values[safeIndex] as T, index: safeIndex, next, prev, setIndex, set };
}
