import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * `false` on the server (and during hydration), `true` on the client.
 * Use it to render browser-only UI without hydration mismatches (SSR / Next.js).
 *
 * @example
 * const isClient = useIsClient();
 * return isClient ? <Chart /> : null;
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
