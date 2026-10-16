import { useCallback, useSyncExternalStore } from 'react'
import { isBrowser, noop } from '../_internal'

/**
 * Subscribes to a CSS media query.
 * @example const isWide = useMediaQuery('(min-width: 900px)')
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!isBrowser) return noop
      const mql = window.matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => defaultValue)
}

/** User prefers reduced motion. */
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
/** Primary input is a touch screen. */
export const useIsTouchDevice = () => useMediaQuery('(pointer: coarse)')
/** Device is in landscape orientation. */
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)')
/** User prefers high contrast. */
export const usePrefersHighContrast = () => useMediaQuery('(prefers-contrast: more)')
/** Page is being printed. */
export const useIsPrinting = () => useMediaQuery('print')
