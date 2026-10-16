import { useEffect, useRef, useState } from 'react';

/**
 * Returns a throttled copy of `value` that updates at most once per `interval` ms.
 * (The first change is applied immediately, the last change is never lost.)
 *
 * @example
 * const scrollY = useWindowScroll().y;
 * const throttledY = useThrottle(scrollY, 200);
 */
export function useThrottle<T>(value: T, interval = 500): T {
  const [throttled, setThrottled] = useState(value);
  const lastRun = useRef(0);

  useEffect(() => {
    const elapsed = Date.now() - lastRun.current;

    if (elapsed >= interval) {
      lastRun.current = Date.now();
      setThrottled(value);
      return;
    }

    const id = setTimeout(() => {
      lastRun.current = Date.now();
      setThrottled(value);
    }, interval - elapsed);

    return () => clearTimeout(id);
  }, [value, interval]);

  return throttled;
}
