import { useEffect, useLayoutEffect } from 'react'
import { isBrowser } from './utils'

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server (SSR safe, no warnings).
 * @example
 * useIsomorphicLayoutEffect(() => { el.focus() }, [])
 */
export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect
