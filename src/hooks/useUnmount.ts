import { useEffect } from 'react';
import { useLatest } from './useLatest';

/**
 * Run a callback when the component unmounts. The callback is always the
 * latest one, so it sees fresh props/state.
 *
 * @example
 * useUnmount(() => analytics.track('left page', { seconds: timeRef.current }));
 */
export function useUnmount(callback: () => void): void {
  const ref = useLatest(callback);
  useEffect(
    () => () => {
      ref.current();
    },
    [ref],
  );
}
