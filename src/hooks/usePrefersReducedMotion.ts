import { useMediaQuery } from './useMediaQuery';

/**
 * `true` when the user asked the OS for reduced motion — disable heavy animations.
 *
 * @example
 * const reduce = usePrefersReducedMotion();
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
