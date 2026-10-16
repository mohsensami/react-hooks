import { useEffect, useState } from 'react';

/**
 * Avoid spinner flicker: show the loader only if loading takes longer than `delay`,
 * and keep it visible at least `minDuration` once shown.
 *
 * @example
 * const showSpinner = useDelayedLoading(isLoading, { delay: 200, minDuration: 500 });
 */
export function useDelayedLoading(loading: boolean, { delay = 200, minDuration = 500 } = {}): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), minDuration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, delay, minDuration]);

  return visible;
}
