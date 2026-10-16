import { useEffect } from 'react'
import { resolveTarget } from '../_internal'
import type { TargetLike } from '../_internal'
import { useRafState } from '../timing/useAnimationFrame'

export interface MouseState {
  x: number
  y: number
  pageX: number
  pageY: number
  /** position relative to the element (when a target is given) */
  elementX: number
  elementY: number
  isInside: boolean
}

/**
 * Mouse position (rAF-throttled). With a target also gives element-relative coordinates.
 * @example const { x, y } = useMouse(); const { elementX, isInside } = useMouse(boxRef)
 */
export function useMouse(target?: TargetLike<HTMLElement>): MouseState {
  const [state, setState] = useRafState<MouseState>({ x: 0, y: 0, pageX: 0, pageY: 0, elementX: 0, elementY: 0, isInside: false })
  useEffect(() => {
    const el = resolveTarget<HTMLElement>(target, null)
    const onMove = (e: MouseEvent) => {
      let elementX = 0
      let elementY = 0
      let isInside = false
      if (el) {
        const r = el.getBoundingClientRect()
        elementX = e.clientX - r.left
        elementY = e.clientY - r.top
        isInside = elementX >= 0 && elementY >= 0 && elementX <= r.width && elementY <= r.height
      }
      setState({ x: e.clientX, y: e.clientY, pageX: e.pageX, pageY: e.pageY, elementX, elementY, isInside })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [target, setState])
  return state
}
