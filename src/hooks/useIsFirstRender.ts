import { useRef } from 'react';

/**
 * `true` only during the very first render of the component.
 *
 * @example
 * const isFirst = useIsFirstRender();
 * if (isFirst) console.log('first render');
 */
export function useIsFirstRender(): boolean {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return false;
}
