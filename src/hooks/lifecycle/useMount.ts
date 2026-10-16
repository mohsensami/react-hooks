import { useEffect } from 'react'

/** Runs once after mount. May return a cleanup function. */
export function useMount(effect: () => void | (() => void)) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [])
}
