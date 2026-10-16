import { useEffect, useState } from 'react'
import type { RefCallback } from 'react'

/**
 * Is the element hovered?
 * @example const [ref, hovered] = useHover<HTMLDivElement>(); <div ref={ref} />
 */
export function useHover<T extends HTMLElement = HTMLElement>(): [RefCallback<T>, boolean] {
  const [el, setEl] = useState<T | null>(null)
  const [hovered, setHovered] = useState(false)
  useEffect(() => {
    if (!el) return
    const on = () => setHovered(true)
    const off = () => setHovered(false)
    el.addEventListener('mouseenter', on)
    el.addEventListener('mouseleave', off)
    return () => {
      el.removeEventListener('mouseenter', on)
      el.removeEventListener('mouseleave', off)
      setHovered(false)
    }
  }, [el])
  return [setEl, hovered]
}
