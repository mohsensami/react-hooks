import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useRafState } from './useRafState';

export interface MouseState {
  /** Position relative to the viewport */
  clientX: number;
  clientY: number;
  /** Position relative to the whole page (includes scroll) */
  pageX: number;
  pageY: number;
  /** Position relative to the screen */
  screenX: number;
  screenY: number;
  /** Position relative to the target element (when a ref is given), else same as client */
  elementX: number;
  elementY: number;
  /** Element size (0 without ref) */
  elementW: number;
  elementH: number;
  /** Is the pointer inside the target element? (always true without ref) */
  isInside: boolean;
}

const INITIAL: MouseState = {
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  screenX: 0,
  screenY: 0,
  elementX: 0,
  elementY: 0,
  elementW: 0,
  elementH: 0,
  isInside: true,
};

/**
 * Mouse position (throttled to animation frames). Pass a ref to also get the
 * position relative to that element.
 *
 * @example
 * const mouse = useMouse();
 * const boxRef = useRef<HTMLDivElement>(null);
 * const box = useMouse(boxRef); // box.elementX, box.isInside
 */
export function useMouse<T extends HTMLElement>(ref?: RefObject<T | null>): MouseState {
  const [state, setState] = useRafState<MouseState>(INITIAL);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const el = ref?.current;
      let next: MouseState = {
        clientX: event.clientX,
        clientY: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
        screenX: event.screenX,
        screenY: event.screenY,
        elementX: event.clientX,
        elementY: event.clientY,
        elementW: 0,
        elementH: 0,
        isInside: true,
      };

      if (el) {
        const rect = el.getBoundingClientRect();
        const elementX = event.clientX - rect.left;
        const elementY = event.clientY - rect.top;
        next = {
          ...next,
          elementX,
          elementY,
          elementW: rect.width,
          elementH: rect.height,
          isInside: elementX >= 0 && elementY >= 0 && elementX <= rect.width && elementY <= rect.height,
        };
      }

      setState(next);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    return () => document.removeEventListener('mousemove', onMove);
  }, [ref, setState]);

  return state;
}
