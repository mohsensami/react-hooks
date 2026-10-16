import { useEffect } from 'react'

/**
 * Shows the browser's "Leave site?" dialog while `enabled` (unsaved changes).
 * @example useBeforeUnload(isDirty)
 */
export function useBeforeUnload(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [enabled])
}
