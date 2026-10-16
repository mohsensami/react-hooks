import { useCallback, useState, useTransition } from 'react';
import { toError } from './utils';

/**
 * React 19 async transitions with error capture. The UI stays interactive
 * while `isPending` is true.
 *
 * @example
 * const { run, isPending, error } = useAsyncTransition();
 * <button onClick={() => run(async () => { await api.save(); setSaved(true); })}>Save</button>
 */
export function useAsyncTransition() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(
    (fn: () => void | Promise<void>) => {
      setError(null);
      startTransition(async () => {
        try {
          await fn();
        } catch (e) {
          setError(toError(e));
        }
      });
    },
    [startTransition],
  );

  return { run, isPending, error, clearError: () => setError(null) };
}
