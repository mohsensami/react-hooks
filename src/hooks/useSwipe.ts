import { useCallback, useRef } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useLatest } from './useLatest';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeInfo {
  direction: SwipeDirection;
  /** Distance in px */
  distance: number;
  dx: number;
  dy: number;
  /** Speed in px/ms */
  velocity: number;
}

export interface UseSwipeOptions {
  /** Minimum distance in px to count as a swipe (default: 50) */
  threshold?: number;
  /** Maximum duration in ms (default: 1000) */
  maxDuration?: number;
  onSwipe?: (info: SwipeInfo) => void;
  onSwipeLeft?: (info: SwipeInfo) => void;
  onSwipeRight?: (info: SwipeInfo) => void;
  onSwipeUp?: (info: SwipeInfo) => void;
  onSwipeDown?: (info: SwipeInfo) => void;
}

export interface UseSwipeReturn {
  handlers: {
    onPointerDown: (event: ReactPointerEvent) => void;
    onPointerUp: (event: ReactPointerEvent) => void;
    onPointerCancel: () => void;
  };
  /** Add this style so vertical scrolling still works while detecting horizontal swipes */
  style: CSSProperties;
}

/**
 * Detect swipe gestures on touch / mouse / pen.
 *
 * @example
 * const { handlers, style } = useSwipe({ onSwipeLeft: next, onSwipeRight: prev });
 * <div {...handlers} style={style}>carousel</div>
 */
export function useSwipe(options: UseSwipeOptions = {}): UseSwipeReturn {
  const { threshold = 50, maxDuration = 1000 } = options;
  const optionsRef = useLatest(options);
  const start = useRef<{ x: number; y: number; time: number } | null>(null);

  const onPointerDown = useCallback((event: ReactPointerEvent) => {
    start.current = { x: event.clientX, y: event.clientY, time: Date.now() };
  }, []);

  const onPointerUp = useCallback(
    (event: ReactPointerEvent) => {
      const origin = start.current;
      start.current = null;
      if (!origin) return;

      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      const duration = Date.now() - origin.time;
      const distanceX = Math.abs(dx);
      const distanceY = Math.abs(dy);
      const distance = Math.max(distanceX, distanceY);
      if (distance < threshold || duration > maxDuration) return;

      const direction: SwipeDirection =
        distanceX > distanceY ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      const info: SwipeInfo = { direction, distance, dx, dy, velocity: distance / Math.max(duration, 1) };

      const o = optionsRef.current;
      o.onSwipe?.(info);
      if (direction === 'left') o.onSwipeLeft?.(info);
      else if (direction === 'right') o.onSwipeRight?.(info);
      else if (direction === 'up') o.onSwipeUp?.(info);
      else o.onSwipeDown?.(info);
    },
    [threshold, maxDuration, optionsRef],
  );

  const onPointerCancel = useCallback(() => {
    start.current = null;
  }, []);

  return {
    handlers: { onPointerDown, onPointerUp, onPointerCancel },
    style: { touchAction: 'pan-y' },
  };
}
