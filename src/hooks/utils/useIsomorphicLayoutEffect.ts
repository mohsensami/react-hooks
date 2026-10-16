import { useEffect, useLayoutEffect } from 'react'
import { isBrowser } from '../_internal'

/** `useLayoutEffect` in the browser, `useEffect` on the server (no SSR warning). */
export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect
