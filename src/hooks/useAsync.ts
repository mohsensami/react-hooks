import { useCallback, useEffect, useRef, useState } from 'react';
import type { DependencyList } from 'react';
import { useIsMounted } from './useIsMounted';
import { useLatest } from './useLatest';
import { sleep, toError } from './utils';

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

export interface UseAsyncOptions<T, Args extends unknown[]> {
  /** Run automatically on mount (and whenever `deps` change). Default: false */
  immediate?: boolean;
  /** Arguments used for the automatic run */
  args?: Args;
  /** Extra dependencies that re-trigger the automatic run (keep the length constant) */
  deps?: DependencyList;
  /** Value of `data` before the first success */
  initialData?: T;
  /** How many times to retry on failure (default: 0) */
  retry?: number;
  /** Delay between retries in ms; multiplied by the attempt number (default: 1000) */
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface UseAsyncReturn<T, Args extends unknown[]> {
  data: T | undefined;
  error: Error | undefined;
  status: AsyncStatus;
  isIdle: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  /** Run the async function. Resolves with the data, or `undefined` on failure / when superseded. */
  execute: (...args: Args) => Promise<T | undefined>;
  /** Back to the idle state (ignores any in-flight call) */
  reset: () => void;
}

/**
 * Run any async function with loading / error / data state, race-condition
 * protection (only the latest call wins), optional retries and auto-run.
 *
 * @example
 * const { data, isPending, error, execute } = useAsync(
 *   (id: number) => api.getUser(id),
 *   { immediate: true, args: [1] },
 * );
 * <button onClick={() => execute(2)}>load user 2</button>
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T, Args> = {},
): UseAsyncReturn<T, Args> {
  const { immediate = false, args, deps = [], initialData } = options;
  const fnRef = useLatest(asyncFn);
  const optionsRef = useLatest(options);
  const isMounted = useIsMounted();
  const callId = useRef(0);

  const [state, setState] = useState<{
    data: T | undefined;
    error: Error | undefined;
    status: AsyncStatus;
  }>({ data: initialData, error: undefined, status: 'idle' });

  const execute = useCallback(
    async (...callArgs: Args): Promise<T | undefined> => {
      const id = ++callId.current;
      setState((prev) => ({ ...prev, status: 'pending', error: undefined }));

      let attempt = 0;
      for (;;) {
        try {
          const data = await fnRef.current(...callArgs);
          if (id !== callId.current || !isMounted()) return undefined;
          setState({ data, error: undefined, status: 'success' });
          optionsRef.current.onSuccess?.(data);
          return data;
        } catch (caught) {
          if (id !== callId.current) return undefined;
          const { retry = 0, retryDelay = 1000 } = optionsRef.current;
          if (attempt < retry) {
            attempt += 1;
            await sleep(retryDelay * attempt);
            if (id !== callId.current) return undefined;
            continue;
          }
          const error = toError(caught);
          if (!isMounted()) return undefined;
          setState((prev) => ({ ...prev, error, status: 'error' }));
          optionsRef.current.onError?.(error);
          return undefined;
        }
      }
    },
    [fnRef, optionsRef, isMounted],
  );

  const reset = useCallback(() => {
    callId.current += 1;
    setState({ data: optionsRef.current.initialData, error: undefined, status: 'idle' });
  }, [optionsRef]);

  useEffect(() => {
    if (immediate) void execute(...((args ?? []) as unknown as Args));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, execute, ...deps]);

  // invalidate in-flight calls on unmount
  useEffect(
    () => () => {
      callId.current += 1;
    },
    [],
  );

  return {
    ...state,
    isIdle: state.status === 'idle',
    isPending: state.status === 'pending',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    execute,
    reset,
  };
}
