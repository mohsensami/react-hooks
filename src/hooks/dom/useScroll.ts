import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { resolveTarget } from '../_internal'
import type { TargetLike } from '../_internal'

export interface ScrollState {
  x: number
  y: number
  isScrolling: boolean
  directionX: 'left' | 'right' | null
  directionY: 'up' | 'down' | null
  arrived: { top: boolean; bottom: boolean; left: boolean; right: boolean }
}

/**
 * Scroll position + direction of window (default) or an element.
 * @example
 * const { y, directionY, arrived } = useScroll()
 * const { y } = useScroll(boxRef)
 */
export function useScroll(target?: TargetLike<HTMLElement>, { idle = 150, offset = 0 } = {}) {
  const [state, setState] = useState<ScrollState>({
    x: 0,
    y: 0,
    isScrolling: false,
    directionX: null,
    directionY: null,
    arrived: { top: true, bottom: false, left: true, right: false },
  })
  const last = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const el = resolveTarget<HTMLElement>(target, null)
    const isWindow = target === undefined
    const scroller: EventTarget | null = isWindow ? window : el
    if (!scroller) return
    let timer: ReturnType<typeof setTimeout>

    const read = (scrolling: boolean) => {
      const x = isWindow ? window.scrollX : el!.scrollLeft
      const y = isWindow ? window.scrollY : el!.scrollTop
      const root = isWindow ? document.documentElement : el!
      const maxX = root.scrollWidth - root.clientWidth
      const maxY = root.scrollHeight - root.clientHeight
      setState({
        x,
        y,
        isScrolling: scrolling,
        directionX: x > last.current.x ? 'right' : x < last.current.x ? 'left' : null,
        directionY: y > last.current.y ? 'down' : y < last.current.y ? 'up' : null,
        arrived: { top: y <= offset, bottom: maxY - y <= offset, left: x <= offset, right: maxX - x <= offset },
      })
      last.current = { x, y }
    }
    const onScroll = () => {
      read(true)
      clearTimeout(timer)
      timer = setTimeout(() => setState((s) => ({ ...s, isScrolling: false })), idle)
    }
    read(false)
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [target, idle, offset])

  const scrollTo = useCallback(
    (options: ScrollToOptions) => {
      const el = resolveTarget<HTMLElement>(target, null)
      if (target === undefined) window.scrollTo(options)
      else el?.scrollTo(options)
    },
    [target],
  )
  return { ...state, scrollTo }
}

/** Returns a function that smoothly scrolls an element (or ref) into view. */
export function useScrollIntoView(options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' }) {
  return useCallback(
    (target: HTMLElement | RefObject<HTMLElement | null> | null) => {
      resolveTarget<HTMLElement>(target)?.scrollIntoView(options)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(options)],
  )
}
