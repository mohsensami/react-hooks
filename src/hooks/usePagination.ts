import { useCallback, useMemo, useState } from 'react'
import { clamp } from './utils'

export interface UsePaginationOptions {
  /** total number of items */
  total: number
  pageSize?: number
  initialPage?: number
  /** pages shown on each side of the current page */
  siblings?: number
  /** pages always shown at the start/end */
  boundaries?: number
}

export type PaginationItem = number | 'dots'

/**
 * Pagination logic: current page, page range with "dots", slice indexes.
 * @example
 * const p = usePagination({ total: 245, pageSize: 10 })
 * items.slice(p.startIndex, p.endIndex)
 * p.range // [1, 'dots', 4, 5, 6, 'dots', 25]
 */
export function usePagination({
  total,
  pageSize: initialPageSize = 10,
  initialPage = 1,
  siblings = 1,
  boundaries = 1,
}: UsePaginationOptions) {
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const [page, setPageState] = useState(initialPage)
  const current = clamp(page, 1, pageCount)

  const setPage = useCallback((p: number) => setPageState(clamp(p, 1, pageCount)), [pageCount])
  const next = useCallback(() => setPage(current + 1), [setPage, current])
  const prev = useCallback(() => setPage(current - 1), [setPage, current])
  const first = useCallback(() => setPage(1), [setPage])
  const last = useCallback(() => setPage(pageCount), [setPage, pageCount])
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setPageState(1)
  }, [])

  const range = useMemo<PaginationItem[]>(() => {
    const totalNumbers = siblings * 2 + 3 + boundaries * 2
    const seq = (from: number, to: number) => Array.from({ length: Math.max(to - from + 1, 0) }, (_, i) => from + i)
    if (totalNumbers >= pageCount) return seq(1, pageCount)
    const left = Math.max(current - siblings, boundaries)
    const right = Math.min(current + siblings, pageCount - boundaries)
    const showLeftDots = left > boundaries + 2
    const showRightDots = right < pageCount - (boundaries + 1)
    if (!showLeftDots && showRightDots) {
      const leftCount = siblings * 2 + boundaries + 2
      return [...seq(1, leftCount), 'dots', ...seq(pageCount - boundaries + 1, pageCount)]
    }
    if (showLeftDots && !showRightDots) {
      const rightCount = boundaries + 1 + 2 * siblings
      return [...seq(1, boundaries), 'dots', ...seq(pageCount - rightCount, pageCount)]
    }
    return [...seq(1, boundaries), 'dots', ...seq(left, right), 'dots', ...seq(pageCount - boundaries + 1, pageCount)]
  }, [current, pageCount, siblings, boundaries])

  return {
    page: current,
    pageSize,
    pageCount,
    setPage,
    setPageSize,
    next,
    prev,
    first,
    last,
    range,
    startIndex: (current - 1) * pageSize,
    endIndex: Math.min(current * pageSize, total),
    isFirst: current === 1,
    isLast: current === pageCount,
  }
}
