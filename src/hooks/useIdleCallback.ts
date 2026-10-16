import { useCallback, useEffect, useRef } from 'react';

/**
 * Run low-priority work when the browser is idle (`requestIdleCallback`, with setTimeout fallback).
 *
 * @example
 * const { schedule, cancel } = useIdleCallback();
 * schedule(() => sendAnalytics(), { timeout: 2000 });
 */
export function useIdleCallback() {
  const handle = useRef<number | null>(null);
  const isIdle = typeof window !== 'undefined' && 'requestIdleCallback' in window;

  const cancel = useCallback(() => {
    if (handle.current === null) return;
    if (isIdle) window.cancelIdleCallback(handle.current);
    else clearTimeout(handle.current);
    handle.current = null;
  }, [isIdle]);

  const schedule = useCallback(
    (cb: (deadline?: IdleDeadline) => void, options?: IdleRequestOptions) => {
      cancel();
      handle.current = isIdle
        ? window.requestIdleCallback(cb, options)
        : (setTimeout(() => cb(), 1) as unknown as number);
    },
    [isIdle, cancel],
  );

  useEffect(() => cancel, [cancel]);
  return { schedule, cancel };
}
