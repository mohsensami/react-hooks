import { useEffect } from 'react'
import { useLatest } from '../utils/useLatest'

/** Runs `fn` when the component unmounts (always the latest version of fn). */
export function useUnmount(fn: () => void) {
  const ref = useLatest(fn)
  useEffect(() => () => ref.current(), [ref])
}
