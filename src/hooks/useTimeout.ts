import { useCallback, useEffect, useRef } from 'react';
import { useLatest } from './useLatest';

export interface UseTimeoutReturn {
  /** Restart the timer */
  reset: () => void;
  /** Cancel the timer */
  clear: () => void;
}

/**
 * Declarative `setTimeout`. Pass `null` as delay to disable it.
 *
 * @example
 * const { reset, clear } = useTimeout(() => setToast(null), 3000);
 */
export function useTimeout(callback: () => void, delay: number | null): UseTimeoutReturn {
  const callbackRef = useLatest(callback);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clear = useCallback(() => {
    if (timer.current !== undefined) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }
  }, []);

  const reset = useCallback(() => {
    clear();
    if (delay === null) return;
    timer.current = setTimeout(() => {
      timer.current = undefined;
      callbackRef.current();
    }, delay);
  }, [delay, clear, callbackRef]);

  useEffect(() => {
    reset();
    return clear;
  }, [reset, clear]);

  return { reset, clear };
}
