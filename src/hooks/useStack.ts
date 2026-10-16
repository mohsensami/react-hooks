import { useCallback, useState } from 'react';

export interface UseStackReturn<T> {
  stack: T[];
  push: (item: T) => void;
  /** Remove the top item */
  pop: () => void;
  clear: () => void;
  /** Top item (last pushed) */
  peek: T | undefined;
  size: number;
}

/**
 * LIFO stack state (navigation history, undo stacks, breadcrumbs...).
 *
 * @example
 * const { stack, push, pop, peek } = useStack<string>(['home']);
 */
export function useStack<T>(initialValues: readonly T[] = []): UseStackReturn<T> {
  const [stack, setStack] = useState<T[]>(() => [...initialValues]);

  const push = useCallback((item: T) => setStack((s) => [...s, item]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const clear = useCallback(() => setStack([]), []);

  return { stack, push, pop, clear, peek: stack[stack.length - 1], size: stack.length };
}
