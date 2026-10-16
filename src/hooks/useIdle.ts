import { useEffect, useState } from 'react';

const DEFAULT_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll'];

export interface UseIdleOptions {
  /** DOM events that count as activity */
  events?: readonly string[];
  /** Initial idle state (default: false) */
  initialState?: boolean;
}

/**
 * `true` when the user has not interacted with the page for `timeout` ms.
 *
 * @example
 * const isIdle = useIdle(5000);
 * return isIdle ? <ScreenSaver /> : <App />;
 */
export function useIdle(timeout = 60_000, options: UseIdleOptions = {}): boolean {
  const { events = DEFAULT_EVENTS, initialState = false } = options;
  const [idle, setIdle] = useState(initialState);
  const eventsKey = events.join(',');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const names = eventsKey.split(',').filter(Boolean);

    const start = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), timeout);
    };
    const onActivity = () => {
      setIdle(false);
      start();
    };
    const onVisibility = () => {
      if (!document.hidden) onActivity();
    };

    names.forEach((name) => window.addEventListener(name, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      clearTimeout(timer);
      names.forEach((name) => window.removeEventListener(name, onActivity));
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [timeout, eventsKey]);

  return idle;
}
