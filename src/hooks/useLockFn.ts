import { useCallback, useRef, useState } from 'react';

/**
 * Prevent an async function from running twice at the same time
 * (double-click submit protection). Returns `[lockedFn, isLocked]`.
 *
 * @example
 * const [submit, submitting] = useLockFn(async () => { await api.save(); });
 * <button onClick={submit} disabled={submitting}>Save</button>
 */
export function useLockFn<Args extends unknown[], R>(fn: (...args: Args) => Promise<R>) {
  const locked = useRef(false);
  const [isLocked, setIsLocked] = useState(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async (...args: Args): Promise<R | undefined> => {
    if (locked.current) return undefined;
    locked.current = true;
    setIsLocked(true);
    try {
      return await fnRef.current(...args);
    } finally {
      locked.current = false;
      setIsLocked(false);
    }
  }, []);

  return [run, isLocked] as const;
}
