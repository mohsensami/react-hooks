import { useEffect, useMemo, useRef } from 'react';
import { useLatest } from './useLatest';

export interface DebounceOptions {
  /** Invoke on the leading edge (first call of a burst). Default: false */
  leading?: boolean;
  /** Invoke on the trailing edge (after the burst). Default: true */
  trailing?: boolean;
  /** Maximum time (ms) the call may be delayed. Also turns debounce into throttle. */
  maxWait?: number;
}

export interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void;
  /** Drop the pending call */
  cancel: () => void;
  /** Run the pending call right now */
  flush: () => void;
  /** Is a call waiting to be invoked? */
  isPending: () => boolean;
}

/**
 * Debounced version of a callback with `cancel`, `flush` and `isPending`.
 * The returned function is stable while `delay` / options stay the same, and
 * it always calls the latest `callback`. Pending calls are cancelled on unmount.
 *
 * @example
 * const search = useDebouncedCallback((text: string) => api.search(text), 400);
 * <input onChange={(e) => search(e.target.value)} />
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay = 500,
  options: DebounceOptions = {},
): DebouncedFunction<Args> {
  const { leading = false, trailing = true, maxWait } = options;
  const callbackRef = useLatest(callback);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingArgs = useRef<Args | undefined>(undefined);
  const lastInvoke = useRef(0);

  const debounced = useMemo(() => {
    const clearTimers = () => {
      if (timer.current !== undefined) clearTimeout(timer.current);
      if (maxTimer.current !== undefined) clearTimeout(maxTimer.current);
      timer.current = undefined;
      maxTimer.current = undefined;
    };

    const invoke = (args: Args) => {
      lastInvoke.current = Date.now();
      callbackRef.current(...args);
    };

    const invokePending = () => {
      const args = pendingArgs.current;
      pendingArgs.current = undefined;
      if (args) invoke(args);
    };

    const finish = () => {
      clearTimers();
      invokePending();
    };

    const fn = (...args: Args) => {
      const isNewCycle = timer.current === undefined;
      const canLead =
        leading &&
        isNewCycle &&
        (maxWait === undefined || Date.now() - lastInvoke.current >= maxWait);

      if (canLead) {
        invoke(args);
      } else if (trailing) {
        pendingArgs.current = args;
      }

      if (timer.current !== undefined) clearTimeout(timer.current);
      timer.current = setTimeout(finish, delay);

      if (maxWait !== undefined && maxTimer.current === undefined) {
        maxTimer.current = setTimeout(finish, maxWait);
      }
    };

    const cancel = () => {
      clearTimers();
      pendingArgs.current = undefined;
    };

    const flush = () => {
      clearTimers();
      invokePending();
    };

    const isPending = () => timer.current !== undefined;

    return Object.assign(fn, { cancel, flush, isPending });
  }, [delay, leading, trailing, maxWait, callbackRef]);

  useEffect(() => () => debounced.cancel(), [debounced]);

  return debounced;
}
