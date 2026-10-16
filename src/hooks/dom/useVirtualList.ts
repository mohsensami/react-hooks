import { useCallback, useMemo, useRef, useState } from 'react'
import type { CSSProperties, UIEvent } from 'react'

export interface UseVirtualListOptions {
  /** fixed item height in px */
  itemHeight: number
  /** visible container height in px */
  height: number
  /** extra rows rendered above/below. default 4 */
  overscan?: number
}

/**
 * Renders only the visible rows of a huge list (fixed row height).
 * @example
 * const { virtualItems, containerProps, wrapperProps } = useVirtualList(list, { itemHeight: 36, height: 300 })
 * <div {...containerProps}><div {...wrapperProps}>{virtualItems.map(({ data, index }) => <div style={{height: 36}} key={index}>{data}</div>)}</div></div>
 */
export function useVirtualList<T>(list: T[], { itemHeight, height, overscan = 4 }: UseVirtualListOptions) {
  const ref = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const { start, end } = useMemo(() => {
    const visible = Math.ceil(height / itemHeight)
    const s = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    return { start: s, end: Math.min(list.length, s + visible + overscan * 2) }
  }, [scrollTop, height, itemHeight, overscan, list.length])

  const virtualItems = useMemo(
    () => list.slice(start, end).map((data, i) => ({ data, index: start + i })),
    [list, start, end],
  )
  const scrollTo = useCallback((index: number) => ref.current?.scrollTo({ top: index * itemHeight }), [itemHeight])

  const containerProps = {
    ref,
    onScroll: (e: UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop),
    style: { height, overflowY: 'auto' } as CSSProperties,
  }
  const wrapperProps = {
    style: { height: list.length * itemHeight - start * itemHeight, marginTop: start * itemHeight } as CSSProperties,
  }
  return { virtualItems, containerProps, wrapperProps, scrollTo, start, end }
}
