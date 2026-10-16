import { useCallback, useMemo, useRef, useState } from 'react';
import type { CSSProperties, UIEvent } from 'react';

export interface UseVirtualListOptions {
  /** fixed height of every row in px */
  itemHeight: number;
  /** visible height of the scroll container in px */
  containerHeight: number;
  /** extra rows rendered above/below the viewport (default 3) */
  overscan?: number;
}

/**
 * Virtualize a long list with fixed-height rows: only visible rows are rendered.
 *
 * @example
 * const { list, containerProps, wrapperProps, scrollToIndex } =
 *   useVirtualList(bigArray, { itemHeight: 40, containerHeight: 400 });
 * <div {...containerProps}>
 *   <div {...wrapperProps}>
 *     {list.map(({ item, index }) => <div key={index} style={{ height: 40 }}>{item}</div>)}
 *   </div>
 * </div>
 */
export function useVirtualList<T>(items: T[], { itemHeight, containerHeight, overscan = 3 }: UseVirtualListOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const end = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);

  const list = useMemo(
    () => items.slice(start, end).map((item, i) => ({ item, index: start + i })),
    [items, start, end],
  );

  const onScroll = useCallback((e: UIEvent<HTMLElement>) => setScrollTop(e.currentTarget.scrollTop), []);
  const scrollToIndex = useCallback(
    (index: number) => ref.current?.scrollTo({ top: Math.max(0, index) * itemHeight }),
    [itemHeight],
  );

  const containerProps = { ref, onScroll, style: { height: containerHeight, overflowY: 'auto' } as CSSProperties };
  const wrapperProps = {
    style: {
      height: items.length * itemHeight - start * itemHeight,
      paddingTop: start * itemHeight,
      boxSizing: 'border-box',
    } as CSSProperties,
  };

  return { list, containerProps, wrapperProps, scrollToIndex, range: [start, end] as const };
}
