import { useEffect } from 'react';
import { useLatest } from './useLatest';

/**
 * Run a callback once, after the first render.
 *
 * @example
 * useMount(() => console.log('mounted'));
 */
export function useMount(callback: () => void): void {
  const ref = useLatest(callback);
  useEffect(() => {
    ref.current();
  }, [ref]);
}
