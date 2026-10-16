import { useCallback, useSyncExternalStore } from 'react';

export interface UseMediaQueryOptions {
  /** Value used on the server / before hydration (default: false) */
  defaultValue?: boolean;
}

/**
 * Subscribe to a CSS media query.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isLandscape = useMediaQuery('(orientation: landscape)');
 * const isPrint = useMediaQuery('print');
 */
export function useMediaQuery(query: string, options: UseMediaQueryOptions = {}): boolean {
  const { defaultValue = false } = options;

  const subscribe = useCallback(
    (callback: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', callback);
      return () => mediaQueryList.removeEventListener('change', callback);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => defaultValue,
  );
}

/** `true` when the user prefers reduced motion (disable heavy animations). */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** The operating-system color scheme: `'dark' | 'light'`. */
export function useColorScheme(): 'dark' | 'light' {
  return useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
}
