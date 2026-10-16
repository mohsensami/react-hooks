import { useCallback, useRef } from 'react';
import type { MouseEvent, PointerEvent, TouchEvent } from 'react';
import { useLatest } from './useLatest';

type PressEvent = MouseEvent | TouchEvent | PointerEvent;

export interface UseLongPressOptions {
  /** How long to hold in ms (default: 400) */
  threshold?: number;
  /** Called when the press starts */
  onStart?: (event: PressEvent) => void;
  /** Called when the press ends WITHOUT reaching the threshold (a normal click) */
  onCancel?: (event: PressEvent) => void;
  /** Called when the press ends after a long press */
  onFinish?: (event: PressEvent) => void;
  /** Pointer movement (px) that cancels the long press (default: 10) */
  moveTolerance?: number;
  disabled?: boolean;
}

export interface LongPressHandlers {
  onPointerDown: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerLeave: (event: PointerEvent) => void;
  onPointerCancel: (event: PointerEvent) => void;
  onContextMenu: (event: MouseEvent) => void;
}

/**
 * Detects a long press (hold) with mouse, touch or pen.
 * Spread the returned handlers on any element.
 *
 * @example
 * const handlers = useLongPress(() => alert('long!'), { threshold: 600 });
 * <button {...handlers}>Hold me</button>
 */
export function useLongPress(
  onLongPress: (event: PressEvent) => void,
  options: UseLongPressOptions = {},
): LongPressHandlers {
  const { threshold = 400, moveTolerance = 10, disabled = false } = options;
  const callbackRef = useLatest(onLongPress);
  const optionsRef = useLatest(options);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fired = useRef(false);
  const active = useRef(false);
  const origin = useRef({ x: 0, y: 0 });

  const clear = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
  };

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return;
      fired.current = false;
      active.current = true;
      origin.current = { x: event.clientX, y: event.clientY };
      optionsRef.current.onStart?.(event);
      event.persist?.();

      clear();
      timer.current = setTimeout(() => {
        fired.current = true;
        callbackRef.current(event);
      }, threshold);
    },
    [disabled, threshold, callbackRef, optionsRef],
  );

  const end = useCallback(
    (event: PointerEvent) => {
      if (!active.current) return;
      active.current = false;
      clear();
      if (fired.current) optionsRef.current.onFinish?.(event);
      else optionsRef.current.onCancel?.(event);
    },
    [optionsRef],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!active.current || fired.current) return;
      const dx = event.clientX - origin.current.x;
      const dy = event.clientY - origin.current.y;
      if (Math.hypot(dx, dy) > moveTolerance) {
        active.current = false;
        clear();
        optionsRef.current.onCancel?.(event);
      }
    },
    [moveTolerance, optionsRef],
  );

  const onContextMenu = useCallback((event: MouseEvent) => {
    // Mobile browsers open the context menu on long press; prevent it while pressing.
    if (active.current || fired.current) event.preventDefault();
  }, []);

  return {
    onPointerDown,
    onPointerUp: end,
    onPointerMove,
    onPointerLeave: end,
    onPointerCancel: end,
    onContextMenu,
  };
}
