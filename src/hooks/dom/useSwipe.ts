import { useEffect, useRef, useState } from 'react'
import { resolveTarget } from '../_internal'
import type { TargetLike } from '../_internal'
import { useLatest } from '../utils/useLatest'

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface UseSwipeOptions {
  /** minimal distance (px) to count as swipe. default 50 */
  threshold?: number
  onSwipe?: (direction: SwipeDirection, e: PointerEvent) => void
  onSwipeEnd?: (direction: SwipeDirection | null, e: PointerEvent) => void
}

/**
 * Swipe gesture on an element. Add CSS `touch-action: pan-y` (or none) on the element for touch screens.
 * @example const { direction, isSwiping, distanceX } = useSwipe(ref, { onSwipe: d => ... })
 */
export function useSwipe(target: TargetLike<HTMLElement>, { threshold = 50, onSwipe, onSwipeEnd }: UseSwipeOptions = {}) {
  const [isSwiping, setSwiping] = useState(false)
  const [direction, setDirection] = useState<SwipeDirection | null>(null)
  const [delta, setDelta] = useState({ x: 0, y: 0 })
  const cbs = useLatest({ onSwipe, onSwipeEnd })
  const origin = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const el = resolveTarget<HTMLElement>(target)
    if (!el) return
    const dirOf = (dx: number, dy: number): SwipeDirection | null => {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return null
      return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
    }
    const down = (e: PointerEvent) => {
      origin.current = { x: e.clientX, y: e.clientY }
      setDelta({ x: 0, y: 0 })
      setDirection(null)
      setSwiping(true)
      el.setPointerCapture?.(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!el.hasPointerCapture?.(e.pointerId)) return
      const dx = e.clientX - origin.current.x
      const dy = e.clientY - origin.current.y
      setDelta({ x: dx, y: dy })
      setDirection(dirOf(dx, dy))
    }
    const up = (e: PointerEvent) => {
      const dx = e.clientX - origin.current.x
      const dy = e.clientY - origin.current.y
      const d = dirOf(dx, dy)
      setSwiping(false)
      if (d) cbs.current.onSwipe?.(d, e)
      cbs.current.onSwipeEnd?.(d, e)
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [target, threshold, cbs])

  return { isSwiping, direction, distanceX: delta.x, distanceY: delta.y }
}
