import { useState } from 'react';
import { useInterval } from './useInterval';

/**
 * A live `Date` that refreshes every `interval` ms (default 1000). Pass `null` to freeze.
 *
 * @example
 * const now = useNow(1000);
 * <p>{now.toLocaleTimeString()}</p>
 */
export function useNow(interval: number | null = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useInterval(() => setNow(new Date()), interval);
  return now;
}
