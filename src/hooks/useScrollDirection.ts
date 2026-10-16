import { useEffect, useRef, useState } from 'react';

export type VerticalScrollDirection = 'up' | 'down' | null;

/**
 * Direction of the page scroll (`'up' | 'down'`, `null` before any scroll).
 * Perfect for "hide the header when scrolling down".
 *
 * @example
 * const direction = useScrollDirection(10);
 * <header className={direction === 'down' ? 'hidden' : ''} />
 */
export function useScrollDirection(threshold = 10): VerticalScrollDirection {
  const [direction, setDirection] = useState<VerticalScrollDirection>(null);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const diff = y - lastY.current;
      if (Math.abs(diff) < threshold) return;
      setDirection(diff > 0 ? 'down' : 'up');
      lastY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return direction;
}
