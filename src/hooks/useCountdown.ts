import { useCallback, useEffect, useState } from 'react';
import { useInterval } from './useInterval';
import { useLatest } from './useLatest';

export interface UseCountdownOptions {
  /** Start counting immediately (default: false) */
  autoStart?: boolean;
  /** Called once when the countdown reaches 0 */
  onComplete?: () => void;
}

export interface UseCountdownReturn {
  /** Seconds left */
  count: number;
  isRunning: boolean;
  isFinished: boolean;
  start: () => void;
  pause: () => void;
  /** Reset (optionally to a new number of seconds) and stop */
  reset: (seconds?: number) => void;
  /** "MM:SS" */
  formatted: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Countdown timer in seconds.
 *
 * @example
 * const { formatted, start, pause, reset, isFinished } = useCountdown(60, { onComplete: () => alert('done') });
 */
export function useCountdown(
  initialSeconds: number,
  options: UseCountdownOptions = {},
): UseCountdownReturn {
  const { autoStart = false, onComplete } = options;
  const onCompleteRef = useLatest(onComplete);
  const [initial, setInitial] = useState(initialSeconds);
  const [count, setCount] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useInterval(() => setCount((c) => Math.max(0, c - 1)), isRunning && count > 0 ? 1000 : null);

  useEffect(() => {
    if (isRunning && count <= 0) {
      setIsRunning(false);
      onCompleteRef.current?.();
    }
  }, [isRunning, count, onCompleteRef]);

  const start = useCallback(() => {
    if (count <= 0) setCount(initial);
    setIsRunning(true);
  }, [count, initial]);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(
    (seconds?: number) => {
      const next = seconds ?? initial;
      setInitial(next);
      setCount(next);
      setIsRunning(false);
    },
    [initial],
  );

  return {
    count,
    isRunning,
    isFinished: count <= 0,
    start,
    pause,
    reset,
    formatted: `${pad(Math.floor(count / 60))}:${pad(count % 60)}`,
  };
}
