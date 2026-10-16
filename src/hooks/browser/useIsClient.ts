import { useSyncExternalStore } from 'react'

const noopSub = () => () => {}

/** `false` on the server / during hydration, `true` in the browser. Avoid hydration mismatches. */
export function useIsClient(): boolean {
  return useSyncExternalStore(noopSub, () => true, () => false)
}
