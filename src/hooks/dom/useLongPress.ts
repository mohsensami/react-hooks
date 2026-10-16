import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useLatest } from '../utils/useLatest'

export interface UseLongPressOptions {
  /** ms to hold. default 400 */
  delay?: number
  onStart?: (e: ReactPointerEvent) => void
  onCancel?: (e: ReactPointerEvent) => void
  onFinish?: (e: ReactPointerEvent) => void
}

/**
 * Long-press (hold) gesture. Spread the returned props on any element.
 * @example <button {...useLongPress(() => alert('held!'), { delay: 600 })}>Hold me</button>
 */
export function useLongPress(callback: (e: ReactPointerEvent) => void, { delay = 400, onStart, onCancel, onFinish }: UseLongPressOptions = {}) {
  const cb = useLatest(callback)
  const hooks = useLatest({ onStart, onCancel, onFinish })
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const fired = useRef(false)

  const start = useCallback(
    (e: ReactPointerEvent) => {
      fired.current = false
      hooks.current.onStart?.(e)
      e.persist?.()
      timer.current = setTimeout(() => {
        fired.current = true
        cb.current(e)
      }, delay)
    },
    [delay, cb, hooks],
  )
  const cancel = useCallback(
    (e: ReactPointerEvent) => {
      clearTimeout(timer.current)
      if (fired.current) hooks.current.onFinish?.(e)
      else if (timer.current) hooks.current.onCancel?.(e)
      timer.current = undefined
    },
    [hooks],
  )
  useEffect(() => () => clearTimeout(timer.current), [])

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  }
}
