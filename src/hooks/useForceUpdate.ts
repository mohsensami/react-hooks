import { useReducer } from 'react';

/**
 * Returns a stable function that forces the component to re-render.
 * (Use sparingly — usually state is the better tool.)
 *
 * @example
 * const forceUpdate = useForceUpdate();
 * <button onClick={forceUpdate}>re-render</button>
 */
export function useForceUpdate(): () => void {
  const [, dispatch] = useReducer((n: number) => n + 1, 0);
  return dispatch as () => void;
}
