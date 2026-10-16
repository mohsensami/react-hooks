import { useCallback, useMemo, useSyncExternalStore } from 'react';

export interface UseWindowScrollReturn {
  x: number;
  y: number;
  scrollTo: (options: ScrollToOptions) => void;
  scrollToTop: (behavior?: ScrollBehavior) => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

function subscribe(callback: () => void) {
  window.addEventListener('scroll', callback, { passive: true });
  return () => window.removeEventListener('scroll', callback);
}

/**
 * Window scroll position + scroll helpers.
 *
 * @example
 * const { y, scrollToTop } = useWindowScroll();
 * {y > 300 && <button onClick={() => scrollToTop()}>↑ top</button>}
 */
export function useWindowScroll(): UseWindowScrollReturn {
  const x = useSyncExternalStore(subscribe, () => window.scrollX, () => 0);
  const y = useSyncExternalStore(subscribe, () => window.scrollY, () => 0);

  const scrollTo = useCallback((options: ScrollToOptions) => window.scrollTo(options), []);
  const scrollToTop = useCallback(
    (behavior: ScrollBehavior = 'smooth') => window.scrollTo({ top: 0, behavior }),
    [],
  );
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior }),
    [],
  );

  return useMemo(
    () => ({ x, y, scrollTo, scrollToTop, scrollToBottom }),
    [x, y, scrollTo, scrollToTop, scrollToBottom],
  );
}
