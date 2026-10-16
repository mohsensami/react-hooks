import { useCallback, useRef, useState } from 'react'

/**
 * FIFO queue state. `remove()` returns the dequeued item synchronously.
 * @example
 * const { add, remove, first, last, size, queue } = useQueue<string>(['a'])
 */
export function useQueue<T>(initial: T[] = []) {
  const [queue, setQueue] = useState<T[]>(initial)
  const ref = useRef(queue)
  const commit = (next: T[]) => {
    ref.current = next
    setQueue(next)
  }
  const add = useCallback((item: T) => commit([...ref.current, item]), [])
  const remove = useCallback((): T | undefined => {
    const [head, ...rest] = ref.current
    commit(rest)
    return head
  }, [])
  const clear = useCallback(() => commit([]), [])
  return { queue, add, remove, clear, first: queue[0], last: queue[queue.length - 1], size: queue.length }
}
