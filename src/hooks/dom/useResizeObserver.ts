import { useEffect, useState } from 'react'
import type { RefCallback } from 'react'
import { resolveTarget } from '../_internal'
import type { TargetLike } from '../_internal'
import { useLatest } from '../utils/useLatest'

/**
 * Observe size changes of an element / ref with `ResizeObserver`.
 * @example useResizeObserver(boxRef, entry => console.log(entry.contentRect.width))
 */
export function useResizeObserver(
  target: TargetLike<Element>,
  callback: (entry: ResizeObserverEntry) => void,
  options?: ResizeObserverOptions,
) {
  const cb = useLatest(callback)
  const box = options?.box
  useEffect(() => {
    const el = resolveTarget<Element>(target)
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => entries.forEach((e) => cb.current(e)))
    ro.observe(el, { box })
    return () => ro.disconnect()
  }, [target, box, cb])
}

/**
 * Width / height of an element (reactive).
 * @example const [ref, { width, height }] = useElementSize<HTMLDivElement>()
 */
export function useElementSize<T extends Element = HTMLDivElement>(): [RefCallback<T>, { width: number; height: number }] {
  const [el, setEl] = useState<T | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((p) => (p.width === width && p.height === height ? p : { width, height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return [setEl, size]
}

export interface Rect {
  x: number; y: number; width: number; height: number
  top: number; right: number; bottom: number; left: number
}
const EMPTY: Rect = { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 }

/**
 * Full bounding rect (position + size) of an element, updated on resize & scroll.
 * @example const [ref, rect] = useMeasure<HTMLDivElement>()
 */
export function useMeasure<T extends Element = HTMLDivElement>(): [RefCallback<T>, Rect] {
  const [el, setEl] = useState<T | null>(null)
  const [rect, setRect] = useState<Rect>(EMPTY)
  useEffect(() => {
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      setRect({ x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left })
    }
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(el)
    window.addEventListener('scroll', measure, { passive: true, capture: true })
    window.addEventListener('resize', measure)
    return () => {
      ro?.disconnect()
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [el])
  return [setEl, rect]
}
