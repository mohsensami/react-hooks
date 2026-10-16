import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Screen Wake Lock API: keep the screen on (video players, recipes, presentations).
 * Re-acquires the lock automatically when the tab becomes visible again.
 *
 * @example
 * const { request, release, active } = useWakeLock();
 */
export function useWakeLock() {
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [active, setActive] = useState(false);
  const sentinel = useRef<WakeLockSentinel | null>(null);
  const wanted = useRef(false);

  const request = useCallback(async () => {
    if (!isSupported) return false;
    wanted.current = true;
    try {
      const s = await navigator.wakeLock.request('screen');
      sentinel.current = s;
      setActive(true);
      s.addEventListener('release', () => setActive(false));
      return true;
    } catch {
      return false;
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    wanted.current = false;
    await sentinel.current?.release();
    sentinel.current = null;
    setActive(false);
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && wanted.current && !sentinel.current?.released) return;
      if (document.visibilityState === 'visible' && wanted.current) void request();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel.current?.release();
    };
  }, [request]);

  return { isSupported, active, request, release };
}
