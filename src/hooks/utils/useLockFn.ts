import { useCallback, useRef, useState } from 'react'
import { useLatest } from './useLatest'

/**
 * Prevents a async function from running concurrently (e.g. double submit).
 * While it is running, extra calls are ignored (resolve with `undefined`).
 * @returns { run, locked }
 */
export function useLockFn<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const lock = useRef(false)
  const [locked, setLocked] = useState(false)
  const fnRef = useLatest(fn)
  const run = useCallback(async (...args: A): Promise<R | undefined> => {
    if (lock.current) return undefined
    lock.current = true
    setLocked(true)
    try {
      return await fnRef.current(...args)
    } finally {
      lock.current = false
      setLocked(false)
    }
  }, [fnRef])
  return { run, locked }
}
