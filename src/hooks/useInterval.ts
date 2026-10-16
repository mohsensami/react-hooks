import { useEffect } from 'react';
import { useLatest } from './useLatest';

export interface UseIntervalOptions {
  /** Also call the callback immediately when the interval starts */
  immediate?: boolean;
}

/**
 * Declarative `setInterval` (Dan Abramov style). The callback may freely read
 * fresh state. Pass `null` as delay to pause.
 *
 * @example
 * const [running, setRunning] = useState(true);
 * useInterval(() => setTick((t) => t + 1), running ? 1000 : null);
 */
export function useInterval(
  callback: () => void,
  delay: number | null,
  options: UseIntervalOptions = {},
): void {
  const { immediate = false } = options;
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (delay === null) return;
    if (immediate) callbackRef.current();
    const id = setInterval(() => callbackRef.current(), delay);
    return () => clearInterval(id);
  }, [delay, immediate, callbackRef]);
}
