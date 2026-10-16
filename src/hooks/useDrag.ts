import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from 'react';

export interface DragState {
  isDragging: boolean;
  /** Total movement since the drag started (px) */
  dx: number;
  dy: number;
  /** Accumulated position (initial position + all previous drags) */
  x: number;
  y: number;
}

export interface UseDragOptions {
  initial?: { x: number; y: number };
  /** Restrict to an axis (default: both) */
  axis?: 'x' | 'y' | 'both';
  /** Keep the element inside this container element */
  bounds?: RefObject<HTMLElement | null>;
  /** Snap position to a grid (px) */
  grid?: number;
  onStart?: (state: DragState) => void;
  onMove?: (state: DragState) => void;
  onEnd?: (state: DragState) => void;
}

export interface UseDragReturn<T extends HTMLElement> {
  /** Attach to the draggable element */
  ref: RefObject<T | null>;
  state: DragState;
  /** Spread on the element that starts the drag (the element itself or a handle) */
  handlers: { onPointerDown: (event: ReactPointerEvent) => void };
  /** Ready-to-use style (`transform` + cursor + touchAction) */
  style: CSSProperties;
  reset: () => void;
}

/**
 * Make an element draggable with pointer events (mouse, touch, pen).
 *
 * @example
 * const { ref, handlers, style } = useDrag<HTMLDivElement>({ bounds: containerRef });
 * <div ref={ref} {...handlers} style={style}>drag me</div>
 */
export function useDrag<T extends HTMLElement = HTMLElement>(
  options: UseDragOptions = {},
): UseDragReturn<T> {
  const { initial = { x: 0, y: 0 }, axis = 'both', grid } = options;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const ref = useRef<T | null>(null);
  const position = useRef(initial);
  const [state, setState] = useState<DragState>({
    isDragging: false,
    dx: 0,
    dy: 0,
    x: initial.x,
    y: initial.y,
  });
  const cleanup = useRef<(() => void) | null>(null);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();

      const startX = event.clientX;
      const startY = event.clientY;
      const base = { ...position.current };

      // Compute allowed range from bounds
      let limits: { minX: number; maxX: number; minY: number; maxY: number } | null = null;
      const el = ref.current;
      const container = optionsRef.current.bounds?.current;
      if (el && container) {
        const elRect = el.getBoundingClientRect();
        const boxRect = container.getBoundingClientRect();
        limits = {
          minX: base.x + (boxRect.left - elRect.left),
          maxX: base.x + (boxRect.right - elRect.right),
          minY: base.y + (boxRect.top - elRect.top),
          maxY: base.y + (boxRect.bottom - elRect.bottom),
        };
      }

      const compute = (clientX: number, clientY: number, isDragging: boolean): DragState => {
        let x = axis === 'y' ? base.x : base.x + (clientX - startX);
        let y = axis === 'x' ? base.y : base.y + (clientY - startY);
        if (grid) {
          x = Math.round(x / grid) * grid;
          y = Math.round(y / grid) * grid;
        }
        if (limits) {
          x = Math.min(Math.max(x, limits.minX), Math.max(limits.minX, limits.maxX));
          y = Math.min(Math.max(y, limits.minY), Math.max(limits.minY, limits.maxY));
        }
        return { isDragging, x, y, dx: x - base.x, dy: y - base.y };
      };

      const move = (e: PointerEvent) => {
        const next = compute(e.clientX, e.clientY, true);
        position.current = { x: next.x, y: next.y };
        setState(next);
        optionsRef.current.onMove?.(next);
      };

      const end = (e: PointerEvent) => {
        const next = compute(e.clientX, e.clientY, false);
        position.current = { x: next.x, y: next.y };
        setState({ ...next, dx: 0, dy: 0 });
        optionsRef.current.onEnd?.(next);
        cleanup.current?.();
      };

      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
      cleanup.current = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
        window.removeEventListener('pointercancel', end);
        cleanup.current = null;
      };

      const started = compute(startX, startY, true);
      setState(started);
      optionsRef.current.onStart?.(started);
    },
    [axis, grid],
  );

  useEffect(() => () => cleanup.current?.(), []);

  const reset = useCallback(() => {
    position.current = { ...initial };
    setState({ isDragging: false, dx: 0, dy: 0, x: initial.x, y: initial.y });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.x, initial.y]);

  const style: CSSProperties = {
    transform: `translate3d(${state.x}px, ${state.y}px, 0)`,
    cursor: state.isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
    userSelect: 'none',
  };

  return { ref, state, handlers: { onPointerDown }, style, reset };
}
