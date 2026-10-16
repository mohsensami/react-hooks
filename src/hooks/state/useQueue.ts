import { useCallback, useRef, useState } from 'react'

/**
 * FIFO queue state.
 * @example const { queue, add, remove, first, size } = useQueue<number>()
 */
export function useQueue<T>(initial: T[] = []) {
  const [queue, setQueue] = useState<T[]>(initial)
  const ref = useRef(queue)
  const update = useCallback((fn: (q: T[]) => T[]) => {
    ref.current = fn(ref.current)
    setQueue(ref.current)
  }, [])

  const add = useCallback((item: T) => update((q) => [...q, item]), [update])
  /** Removes and returns the first item. */
  const remove = useCallback((): T | undefined => {
    const first = ref.current[0]
    update((q) => q.slice(1))
    return first
  }, [update])
  const clear = useCallback(() => update(() => []), [update])

  return { queue, add, remove, clear, first: queue[0], last: queue[queue.length - 1], size: queue.length }
}
