import { useCallback, useState } from 'react';
import { useResizeObserver } from './useResizeObserver';

export interface MeasureRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

const empty: MeasureRect = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0 };

/**
 * Like `useElementSize` but returns the full `DOMRect`-like rectangle.
 *
 * @example
 * const [ref, rect] = useMeasure<HTMLDivElement>();
 */
export function useMeasure<T extends HTMLElement = HTMLElement>(): [(node: T | null) => void, MeasureRect] {
  const [node, setNode] = useState<T | null>(null);
  const [rect, setRect] = useState<MeasureRect>(empty);

  useResizeObserver(node, (entry) => {
    const { x, y, width, height, top, left, bottom, right } = entry.contentRect;
    setRect({ x, y, width, height, top, left, bottom, right });
  });

  const ref = useCallback((el: T | null) => setNode(el), []);
  return [ref, rect];
}
