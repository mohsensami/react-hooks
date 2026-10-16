import { useCallback, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'

export interface UseDraggableOptions {
  initial?: { x: number; y: number }
  /** limit movement: [minX, minY, maxX, maxY] */
  bounds?: [number, number, number, number]
  axis?: 'x' | 'y' | 'both'
  onDragEnd?: (pos: { x: number; y: number }) => void
}

/**
 * Make any element draggable (pointer events – mouse, touch, pen).
 * Spread `bind` on the element.
 * @example const { bind, x, y, isDragging } = useDraggable(); <div {...bind}>drag me</div>
 */
export function useDraggable({ initial = { x: 0, y: 0 }, bounds, axis = 'both', onDragEnd }: UseDraggableOptions = {}) {
  const [pos, setPos] = useState(initial)
  const [isDragging, setDragging] = useState(false)
  const start = useRef({ px: 0, py: 0, x: 0, y: 0 })
  const posRef = useRef(pos)
  posRef.current = pos

  const clamp = useCallback(
    (x: number, y: number) =>
      bounds ? { x: Math.min(bounds[2], Math.max(bounds[0], x)), y: Math.min(bounds[3], Math.max(bounds[1], y)) } : { x, y },
    [bounds],
  )

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { px: e.clientX, py: e.clientY, x: posRef.current.x, y: posRef.current.y }
    setDragging(true)
  }, [])
  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!isDragging) return
      const dx = axis === 'y' ? 0 : e.clientX - start.current.px
      const dy = axis === 'x' ? 0 : e.clientY - start.current.py
      setPos(clamp(start.current.x + dx, start.current.y + dy))
    },
    [isDragging, axis, clamp],
  )
  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId)
      setDragging(false)
      onDragEnd?.(posRef.current)
    },
    [onDragEnd],
  )

  const style: CSSProperties = {
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    touchAction: 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
  }
  return {
    x: pos.x,
    y: pos.y,
    isDragging,
    setPosition: setPos,
    reset: () => setPos(initial),
    bind: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, style },
  }
}
