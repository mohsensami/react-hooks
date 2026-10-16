import { useCallback, useEffect, useRef, useState } from 'react';
import type { SetStateAction } from 'react';

/**
 * `useState` whose setter accepts a callback that runs **after** the state
 * has been committed (like the class `setState(value, callback)`).
 * Note: if the new value is identical to the old one React bails out and
 * the callback is not called.
 *
 * @example
 * const [count, setCount] = useStateCallback(0);
 * setCount(5, (value) => console.log('committed', value));
 */
export function useStateCallback<T>(
  initialState: T | (() => T),
): [state: T, setState: (value: SetStateAction<T>, callback?: (state: T) => void) => void] {
  const [state, setState] = useState<T>(initialState);
  const callbackRef = useRef<((state: T) => void) | null>(null);

  const set = useCallback((value: SetStateAction<T>, callback?: (state: T) => void) => {
    callbackRef.current = callback ?? null;
    setState(value);
  }, []);

  useEffect(() => {
    if (callbackRef.current) {
      const callback = callbackRef.current;
      callbackRef.current = null;
      callback(state);
    }
  }, [state]);

  return [state, set];
}
