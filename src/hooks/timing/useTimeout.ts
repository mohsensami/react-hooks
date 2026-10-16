import { useCallback, useEffect, useRef } from 'react'
import { useLatest } from '../utils/useLatest'

/**
 * `setTimeout` with controls. Pass `null` as delay to disable.
 * @example const { clear, reset, isPending } = useTimeout(() => alert('hi'), 2000)
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const cbRef = useLatest(callback)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pending = useRef(false)

  const clear = useCallback(() => {
    clearTimeout(timer.current)
    pending.current = false
  }, [])
  const set = useCallback(() => {
    clear()
    if (delay === null) return
    pending.current = true
    timer.current = setTimeout(() => {
      pending.current = false
      cbRef.current()
    }, delay)
  }, [delay, clear, cbRef])

  useEffect(() => {
    set()
    return clear
  }, [set, clear])

  return { clear, reset: set, isPending: () => pending.current }
}
