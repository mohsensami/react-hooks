import { useEffect } from 'react';

/**
 * Logs the lifecycle of a component: mount, every update and unmount.
 *
 * @example
 * useLogger('Counter', { count });
 */
export function useLogger(name: string, ...props: unknown[]): void {
  useEffect(() => {
    console.log(`[${name}] mounted`, ...props);
    return () => console.log(`[${name}] unmounted`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log(`[${name}] updated`, ...props);
  });
}
