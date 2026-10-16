import { useMemo, useSyncExternalStore } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

/**
 * Current `window.innerWidth` / `innerHeight` (updates on resize).
 * `initialSize` is what the server renders (SSR).
 *
 * @example
 * const { width, height } = useWindowSize();
 */
export function useWindowSize(initialSize: WindowSize = { width: 0, height: 0 }): WindowSize {
  const width = useSyncExternalStore(subscribe, () => window.innerWidth, () => initialSize.width);
  const height = useSyncExternalStore(subscribe, () => window.innerHeight, () => initialSize.height);
  return useMemo(() => ({ width, height }), [width, height]);
}
