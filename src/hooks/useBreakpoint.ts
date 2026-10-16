import { useWindowSize } from './useWindowSize';

/** Tailwind-like breakpoints (min-width in px). */
export const defaultBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export interface UseBreakpointReturn<T extends Record<string, number>> {
  width: number;
  /** The biggest breakpoint that matches, or `null` below the smallest one */
  current: keyof T | null;
  /** width >= breakpoint */
  isAtLeast: (breakpoint: keyof T) => boolean;
  /** width < breakpoint */
  isBelow: (breakpoint: keyof T) => boolean;
}

/**
 * Responsive breakpoints in JS. Pass your own map to override the defaults.
 *
 * @example
 * const { current, isAtLeast } = useBreakpoint();
 * {isAtLeast('md') ? <Sidebar /> : <BottomNav />}
 */
export function useBreakpoint<T extends Record<string, number> = typeof defaultBreakpoints>(
  breakpoints: T = defaultBreakpoints as unknown as T,
): UseBreakpointReturn<T> {
  const { width } = useWindowSize({ width: 1024, height: 768 });

  const sorted = (Object.entries(breakpoints) as Array<[keyof T, number]>).sort((a, b) => a[1] - b[1]);
  let current: keyof T | null = null;
  for (const [name, min] of sorted) {
    if (width >= min) current = name;
  }

  return {
    width,
    current,
    isAtLeast: (breakpoint) => width >= (breakpoints[breakpoint] as number),
    isBelow: (breakpoint) => width < (breakpoints[breakpoint] as number),
  };
}
