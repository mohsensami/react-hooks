import { useSyncExternalStore } from 'react'

const subscribe = (cb: () => void) => {
  document.addEventListener('visibilitychange', cb)
  return () => document.removeEventListener('visibilitychange', cb)
}

/** Is the tab visible? 'visible' | 'hidden'. @example const v = usePageVisibility() */
export function usePageVisibility(): DocumentVisibilityState {
  return useSyncExternalStore(subscribe, () => document.visibilityState, () => 'visible')
}

const subFocus = (cb: () => void) => {
  window.addEventListener('focus', cb)
  window.addEventListener('blur', cb)
  return () => {
    window.removeEventListener('focus', cb)
    window.removeEventListener('blur', cb)
  }
}
/** Does the window have focus? */
export function useWindowFocus(): boolean {
  return useSyncExternalStore(subFocus, () => document.hasFocus(), () => true)
}
