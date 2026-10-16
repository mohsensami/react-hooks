import { useEffect, useState } from 'react';

export interface OrientationState {
  type: OrientationType | 'unknown';
  angle: number;
  isPortrait: boolean;
  isLandscape: boolean;
}

const read = (): OrientationState => {
  const o = typeof screen !== 'undefined' ? screen.orientation : undefined;
  const type = o?.type ?? 'unknown';
  return {
    type,
    angle: o?.angle ?? 0,
    isPortrait: type.startsWith('portrait'),
    isLandscape: type.startsWith('landscape'),
  };
};

/**
 * Screen orientation (portrait / landscape) and angle.
 *
 * @example
 * const { isPortrait, angle } = useScreenOrientation();
 */
export function useScreenOrientation(): OrientationState {
  const [state, setState] = useState(read);
  useEffect(() => {
    const onChange = () => setState(read());
    screen.orientation?.addEventListener('change', onChange);
    window.addEventListener('orientationchange', onChange);
    return () => {
      screen.orientation?.removeEventListener('change', onChange);
      window.removeEventListener('orientationchange', onChange);
    };
  }, []);
  return state;
}
