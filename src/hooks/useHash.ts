import { useCallback, useSyncExternalStore } from 'react';

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

/**
 * Read & write `location.hash` (without the leading `#`).
 *
 * @example
 * const [hash, setHash] = useHash();
 * setHash('section-2');
 */
export function useHash() {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash.slice(1),
    () => '',
  );
  const setHash = useCallback((next: string) => {
    window.location.hash = next;
  }, []);
  return [hash, setHash] as const;
}
