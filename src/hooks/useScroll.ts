import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useRafState } from './useRafState';

export interface ScrollArrivedState {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export interface ScrollDirections {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export interface UseScrollOptions {
  /** Distance (px) from an edge that still counts as "arrived" (default: 1) */
  offset?: number;
  /** ms without scroll events before `isScrolling` becomes false (default: 150) */
  idle?: number;
}

export interface UseScrollReturn {
  x: number;
  y: number;
  isScrolling: boolean;
  /** Is the scroll position at an edge? (infinite scroll, shadows ...) */
  arrived: ScrollArrivedState;
  /** Direction of the last scroll movement */
  directions: ScrollDirections;
  scrollTo: (options: ScrollToOptions) => void;
}

interface Core {
  x: number;
  y: number;
  arrived: ScrollArrivedState;
  directions: ScrollDirections;
}

const EMPTY: Core = {
  x: 0,
  y: 0,
  arrived: { top: true, bottom: false, left: true, right: false },
  directions: { top: false, bottom: false, left: false, right: false },
};

/**
 * Track the scroll position, direction and edges of a scrollable **element**.
 * (For the page itself use `useWindowScroll`.)
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const { y, arrived } = useScroll(ref);
 * <div ref={ref} style={{ overflow: 'auto', height: 300 }}>...</div>
 */
export function useScroll<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: UseScrollOptions = {},
): UseScrollReturn {
  const { offset = 1, idle = 150 } = options;
  const [core, setCore] = useRafState<Core>(EMPTY);
  const [isScrolling, setIsScrolling] = useState(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      const x = el.scrollLeft;
      const y = el.scrollTop;
      setCore({
        x,
        y,
        arrived: {
          left: x <= offset,
          right: x + el.clientWidth >= el.scrollWidth - offset,
          top: y <= offset,
          bottom: y + el.clientHeight >= el.scrollHeight - offset,
        },
        directions: {
          left: x < last.current.x,
          right: x > last.current.x,
          top: y < last.current.y,
          bottom: y > last.current.y,
        },
      });
      last.current = { x, y };
    };

    const onScroll = () => {
      update();
      setIsScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => setIsScrolling(false), idle);
    };

    last.current = { x: el.scrollLeft, y: el.scrollTop };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', onScroll);
    };
  }, [ref, offset, idle, setCore]);

  const scrollTo = useCallback(
    (scrollOptions: ScrollToOptions) => ref.current?.scrollTo(scrollOptions),
    [ref],
  );

  return { ...core, isScrolling, scrollTo };
}
