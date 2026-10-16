import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Fullscreen API for an element (or the whole page when no target is given).
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const { isFullscreen, toggle } = useFullscreen(ref);
 */
export function useFullscreen<T extends HTMLElement = HTMLElement>(target?: RefObject<T | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isSupported = typeof document !== 'undefined' && !!document.fullscreenEnabled;

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', onChange);
    onChange();
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const enter = useCallback(async () => {
    if (!isSupported) return;
    await (target?.current ?? document.documentElement).requestFullscreen();
  }, [isSupported, target]);

  const exit = useCallback(async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
  }, []);

  const toggle = useCallback(() => (document.fullscreenElement ? exit() : enter()), [enter, exit]);

  return { isFullscreen, isSupported, enter, exit, toggle };
}
