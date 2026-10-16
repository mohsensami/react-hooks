import { useEffect, useState } from 'react';

/**
 * Current `window.devicePixelRatio` (updates on zoom / moving between monitors).
 *
 * @example
 * const dpr = useDevicePixelRatio();
 */
export function useDevicePixelRatio(): number {
  const [dpr, setDpr] = useState(() => (typeof window === 'undefined' ? 1 : window.devicePixelRatio));

  useEffect(() => {
    const mql = window.matchMedia(`(resolution: ${dpr}dppx)`);
    const onChange = () => setDpr(window.devicePixelRatio);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [dpr]);

  return dpr;
}
