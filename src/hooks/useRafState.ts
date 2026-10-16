import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

/**
 * `useState` whose updates are batched to the next animation frame
 * (at most one render per frame — great for mouse / scroll driven state).
 * When called several times in one frame, only the last call wins.
 *
 * @example
 * const [pos, setPos] = useRafState({ x: 0, y: 0 });
 */
export function useRafState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const frame = useRef(0);
  const [state, setState] = useState<S>(initialState);

  const setRafState = useCallback((value: SetStateAction<S>) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setState(value));
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return [state, setRafState];
}
