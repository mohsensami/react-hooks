import { useCallback, useSyncExternalStore } from 'react'

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

/** `location.hash` (without the #) as state. @example const [hash, setHash] = useHash() */
export function useHash() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash.slice(1), () => '')
  const set = useCallback((next: string) => {
    window.location.hash = next
  }, [])
  return [hash, set] as const
}
