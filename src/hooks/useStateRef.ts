import { useCallback, useRef, useState } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';

/**
 * `useState` + a ref that is updated **synchronously** by the setter.
 * Lets you read the freshest value inside async code / event handlers.
 *
 * @example
 * const [count, setCount, countRef] = useStateRef(0);
 * setCount(1);
 * countRef.current; // 1 immediately (state is still 0 until next render)
 */
export function useStateRef<T>(
  initialState: T | (() => T),
): [state: T, setState: Dispatch<SetStateAction<T>>, ref: RefObject<T>] {
  const [state, setStateRaw] = useState<T>(initialState);
  const ref = useRef<T>(state);

  const setState = useCallback((value: SetStateAction<T>) => {
    const next = typeof value === 'function' ? (value as (prev: T) => T)(ref.current) : value;
    ref.current = next;
    setStateRaw(next);
  }, []);

  return [state, setState, ref];
}
