import { useCallback, useEffect, useRef, useState } from 'react';
import { useLatest } from './useLatest';

export interface UsePollingOptions {
  /** Start polling automatically (default: true) */
  enabled?: boolean;
  /** Call immediately before waiting for the first interval (default: true) */
  immediate?: boolean;
  /** Pause while the tab is hidden (default: true) */
  pauseWhenHidden?: boolean;
  /** Stop polling when the task throws (default: false) */
  stopOnError?: boolean;
}

export interface UsePollingReturn {
  isPolling: boolean;
  start: () => void;
  stop: () => void;
}

/**
 * Repeatedly runs an (async) task. The next run is scheduled `interval` ms
 * **after the previous one finished**, so calls never overlap.
 *
 * @example
 * const { isPolling, stop } = usePolling(async () => {
 *   setStatus(await api.getStatus());
 * }, 5000);
 */
export function usePolling(
  task: () => void | Promise<void>,
  interval: number,
  options: UsePollingOptions = {},
): UsePollingReturn {
  const { enabled = true, immediate = true, pauseWhenHidden = true, stopOnError = false } = options;
  const taskRef = useLatest(task);
  const [isPolling, setIsPolling] = useState(enabled);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!isPolling) return;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      timer.current = setTimeout(tick, interval);
    };

    const tick = async () => {
      if (cancelled) return;
      if (pauseWhenHidden && document.hidden) return schedule();
      try {
        await taskRef.current();
      } catch (error) {
        console.error('[usePolling] task failed', error);
        if (stopOnError) {
          setIsPolling(false);
          return;
        }
      }
      schedule();
    };

    if (immediate) void tick();
    else schedule();

    return () => {
      cancelled = true;
      clearTimeout(timer.current);
    };
  }, [isPolling, interval, immediate, pauseWhenHidden, stopOnError, taskRef]);

  const start = useCallback(() => setIsPolling(true), []);
  const stop = useCallback(() => setIsPolling(false), []);

  return { isPolling, start, stop };
}
