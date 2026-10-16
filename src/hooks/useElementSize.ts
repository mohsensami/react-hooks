import { useCallback, useState } from 'react';
import { useResizeObserver } from './useResizeObserver';

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Track the content-box size of an element. Returns a ref to attach and the size.
 *
 * @example
 * const [ref, { width, height }] = useElementSize<HTMLDivElement>();
 * <div ref={ref}>{width} x {height}</div>
 */
export function useElementSize<T extends HTMLElement = HTMLElement>(): [
  (node: T | null) => void,
  ElementSize,
] {
  const [node, setNode] = useState<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useResizeObserver(node, (entry) => {
    const { width, height } = entry.contentRect;
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  });

  const ref = useCallback((el: T | null) => setNode(el), []);
  return [ref, size];
}
