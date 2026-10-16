import { useCallback, useRef, useState } from 'react';
import { useInterval } from './useInterval';

export interface UseStopwatchOptions {
  /** Start immediately (default: false) */
  autoStart?: boolean;
  /** UI refresh rate in ms (default: 100) */
  interval?: number;
}

export interface UseStopwatchReturn {
  /** Elapsed time in milliseconds */
  elapsed: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  /** Save the current time as a lap */
  lap: () => void;
  laps: number[];
  /** "MM:SS.cc" */
  formatted: string;
}

export function formatStopwatch(ms: number): string {
  const totalCentis = Math.floor(ms / 10);
  const centis = totalCentis % 100;
  const seconds = Math.floor(totalCentis / 100) % 60;
  const minutes = Math.floor(totalCentis / 6000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
}

/**
 * Precise stopwatch with pause / resume / laps.
 *
 * @example
 * const { formatted, start, pause, reset, lap, laps } = useStopwatch();
 */
export function useStopwatch(options: UseStopwatchOptions = {}): UseStopwatchReturn {
  const { autoStart = false, interval = 100 } = options;
  const accumulated = useRef(0);
  const startedAt = useRef<number | null>(autoStart ? performance.now() : null);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [laps, setLaps] = useState<number[]>([]);

  const read = useCallback(
    () =>
      accumulated.current +
      (startedAt.current === null ? 0 : performance.now() - startedAt.current),
    [],
  );

  useInterval(() => setElapsed(read()), isRunning ? interval : null);

  const start = useCallback(() => {
    if (startedAt.current !== null) return;
    startedAt.current = performance.now();
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (startedAt.current === null) return;
    accumulated.current += performance.now() - startedAt.current;
    startedAt.current = null;
    setElapsed(accumulated.current);
    setIsRunning(false);
  }, []);

  const toggle = useCallback(() => (startedAt.current === null ? start() : pause()), [start, pause]);

  const reset = useCallback(() => {
    accumulated.current = 0;
    startedAt.current = null;
    setElapsed(0);
    setLaps([]);
    setIsRunning(false);
  }, []);

  const lap = useCallback(() => setLaps((prev) => [...prev, read()]), [read]);

  return { elapsed, isRunning, start, pause, toggle, reset, lap, laps, formatted: formatStopwatch(elapsed) };
}
