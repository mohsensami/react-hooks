import { useCallback, useMemo, useState } from 'react'

export type PaginationItem = number | 'dots'

export interface UsePaginationOptions {
  /** total number of items */
  total: number
  pageSize?: number
  initialPage?: number
  /** pages shown on each side of the current page. default 1 */
  siblings?: number
  /** pages always shown at the edges. default 1 */
  boundaries?: number
}

const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i)

/**
 * Pagination state + the page-number list with "dots" (1 … 4 5 6 … 20).
 * @example const p = usePagination({ total: 200, pageSize: 10 }); data.slice(p.startIndex, p.endIndex)
 */
export function usePagination({ total, pageSize: initialSize = 10, initialPage = 1, siblings = 1, boundaries = 1 }: UsePaginationOptions) {
  const [pageSize, setPageSizeState] = useState(initialSize)
  const [page, setPageState] = useState(initialPage)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)

  const setPage = useCallback((p: number) => setPageState(Math.min(Math.max(1, p), pageCount)), [pageCount])
  const setPageSize = useCallback((s: number) => { setPageSizeState(s); setPageState(1) }, [])
  const next = useCallback(() => setPage(current + 1), [setPage, current])
  const prev = useCallback(() => setPage(current - 1), [setPage, current])

  const pages = useMemo<PaginationItem[]>(() => {
    const totalNumbers = siblings * 2 + 3 + boundaries * 2
    if (totalNumbers >= pageCount) return range(1, pageCount)
    const left = Math.max(current - siblings, boundaries)
    const right = Math.min(current + siblings, pageCount - boundaries)
    const showLeftDots = left > boundaries + 2
    const showRightDots = right < pageCount - (boundaries + 1)
    if (!showLeftDots && showRightDots) {
      const leftCount = siblings * 2 + boundaries + 2
      return [...range(1, leftCount), 'dots', ...range(pageCount - boundaries + 1, pageCount)]
    }
    if (showLeftDots && !showRightDots) {
      const rightCount = boundaries + 1 + 2 * siblings
      return [...range(1, boundaries), 'dots', ...range(pageCount - rightCount + 1, pageCount)]
    }
    return [...range(1, boundaries), 'dots', ...range(left, right), 'dots', ...range(pageCount - boundaries + 1, pageCount)]
  }, [current, pageCount, siblings, boundaries])

  const startIndex = (current - 1) * pageSize
  return {
    page: current, pageSize, pageCount, pages, setPage, setPageSize, next, prev,
    first: () => setPage(1), last: () => setPage(pageCount),
    isFirst: current === 1, isLast: current === pageCount,
    startIndex, endIndex: Math.min(startIndex + pageSize, total),
  }
}
