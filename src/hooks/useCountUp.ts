import { useEffect, useRef, useState } from 'react';

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export interface UseCountUpOptions {
  /** Starting number (default: 0) */
  start?: number;
  /** Animation length in ms (default: 1000) */
  duration?: number;
  /** Easing function (use a stable reference, default: easeOutCubic) */
  easing?: (t: number) => number;
  /** Digits after the decimal point (default: 0) */
  decimals?: number;
  /** Set false to jump to the end value without animation */
  enabled?: boolean;
}

/**
 * Animates a number towards `end` (counters, stats, dashboards).
 * When `end` changes it animates from the current value to the new one.
 *
 * @example
 * const value = useCountUp(1234, { duration: 1500 });
 * <h1>{value.toLocaleString()}</h1>
 */
export function useCountUp(end: number, options: UseCountUpOptions = {}): number {
  const { start = 0, duration = 1000, easing = easeOutCubic, decimals = 0, enabled = true } = options;
  const [value, setValue] = useState(start);
  const current = useRef(start);

  useEffect(() => {
    if (!enabled || duration <= 0) {
      current.current = end;
      setValue(end);
      return;
    }

    const from = current.current;
    const startTime = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const next = from + (end - from) * easing(progress);
      current.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, duration, easing, enabled]);

  return Number(value.toFixed(decimals));
}
