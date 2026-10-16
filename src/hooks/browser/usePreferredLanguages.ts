import { useSyncExternalStore } from 'react'

let cache: readonly string[] = typeof navigator !== 'undefined' ? navigator.languages : ['en']
const subscribe = (cb: () => void) => {
  const handler = () => {
    cache = navigator.languages
    cb()
  }
  window.addEventListener('languagechange', handler)
  return () => window.removeEventListener('languagechange', handler)
}

/** Browser languages in order of preference, e.g. ['fa-IR', 'en-US']. */
export function usePreferredLanguages(): readonly string[] {
  return useSyncExternalStore(subscribe, () => cache, () => ['en'])
}
