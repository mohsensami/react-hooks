import { useReducer } from 'react'

/** Returns a function that forces the component to re-render. */
export function useForceUpdate(): () => void {
  const [, dispatch] = useReducer((x: number) => x + 1, 0)
  return dispatch as () => void
}
