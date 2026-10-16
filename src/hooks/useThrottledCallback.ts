import { useDebouncedCallback } from './useDebouncedCallback';
import type { DebouncedFunction } from './useDebouncedCallback';

export interface ThrottleOptions {
  /** Invoke on the leading edge (default: true) */
  leading?: boolean;
  /** Invoke on the trailing edge (default: true) */
  trailing?: boolean;
}

/**
 * Throttled version of a callback: runs at most once per `interval` ms.
 * Has the same `cancel` / `flush` / `isPending` helpers as `useDebouncedCallback`.
 *
 * @example
 * const onScroll = useThrottledCallback(() => save(window.scrollY), 200);
 * useEventListener('scroll', onScroll);
 */
export function useThrottledCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  interval = 500,
  options: ThrottleOptions = {},
): DebouncedFunction<Args> {
  const { leading = true, trailing = true } = options;
  return useDebouncedCallback(callback, interval, { leading, trailing, maxWait: interval });
}
