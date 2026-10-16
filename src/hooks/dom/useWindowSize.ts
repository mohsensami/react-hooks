import { useMemo, useState } from 'react'
import { isBrowser } from '../_internal'
import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect'

/**
 * Window inner size, updated on resize / orientation change.
 * @example const { width, height } = useWindowSize()
 */
export function useWindowSize({ initialWidth = 0, initialHeight = 0 } = {}) {
  const [size, setSize] = useState(() =>
    isBrowser ? { width: window.innerWidth, height: window.innerHeight } : { width: initialWidth, height: initialHeight },
  )
  useIsomorphicLayoutEffect(() => {
    const update = () =>
      setSize((p) =>
        p.width === window.innerWidth && p.height === window.innerHeight
          ? p
          : { width: window.innerWidth, height: window.innerHeight },
      )
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])
  return size
}

export const defaultBreakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }

/**
 * Current responsive breakpoint (Tailwind-like by default).
 * @example const { current, isAtLeast } = useBreakpoint(); isAtLeast('md')
 */
export function useBreakpoint<T extends Record<string, number> = typeof defaultBreakpoints>(
  breakpoints: T = defaultBreakpoints as unknown as T,
) {
  const { width } = useWindowSize()
  return useMemo(() => {
    let current: keyof T | 'base' = 'base'
    const sorted = Object.entries(breakpoints).sort((a, b) => a[1] - b[1])
    for (const [name, min] of sorted) if (width >= min) current = name as keyof T
    return {
      current,
      width,
      isAtLeast: (name: keyof T) => width >= breakpoints[name],
      isBelow: (name: keyof T) => width < breakpoints[name],
    }
  }, [width, breakpoints])
}
