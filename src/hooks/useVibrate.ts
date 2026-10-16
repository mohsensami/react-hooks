import { useCallback } from 'react';

/**
 * Vibration API (mobile). Pass a number or a pattern `[vibrate, pause, vibrate...]`.
 *
 * @example
 * const { vibrate, stop } = useVibrate();
 * vibrate([100, 50, 100]);
 */
export function useVibrate() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  const vibrate = useCallback((pattern: number | number[] = 200) => isSupported && navigator.vibrate(pattern), [isSupported]);
  const stop = useCallback(() => isSupported && navigator.vibrate(0), [isSupported]);
  return { vibrate, stop, isSupported };
}
