import { useEffect } from 'react'

/**
 * Locks page scrolling (modals / drawers) and compensates the scrollbar width.
 * @example useScrollLock(isModalOpen)
 */
export function useScrollLock(locked = true, target?: HTMLElement | null) {
  useEffect(() => {
    if (!locked) return
    const el = target ?? document.body
    const prevOverflow = el.style.overflow
    const prevPadding = el.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    el.style.overflow = 'hidden'
    if (scrollbar > 0) el.style.paddingRight = `${scrollbar}px`
    return () => {
      el.style.overflow = prevOverflow
      el.style.paddingRight = prevPadding
    }
  }, [locked, target])
}
