import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a stable function telling whether the component is still mounted.
 * Handy to avoid `setState` after an `await` when the component was removed.
 *
 * @example
 * const isMounted = useIsMounted();
 * const data = await fetchData();
 * if (isMounted()) setData(data);
 */
export function useIsMounted(): () => boolean {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return useCallback(() => mounted.current, []);
}
