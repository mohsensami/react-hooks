import { useCallback, useRef, useState } from 'react'
import { resolveSetter } from '../_internal'
import type { Setter } from '../_internal'

interface History<T> {
  past: T[]
  present: T
  future: T[]
}

/**
 * State with undo / redo.
 * @example const { state, set, undo, redo, canUndo, canRedo } = useHistoryState('')
 */
export function useHistoryState<T>(initialValue: T, capacity = 100) {
  const initialRef = useRef(initialValue)
  const [h, setH] = useState<History<T>>({ past: [], present: initialValue, future: [] })

  const set = useCallback(
    (value: Setter<T>) =>
      setH((cur) => {
        const next = resolveSetter(value, cur.present)
        if (Object.is(next, cur.present)) return cur
        return { past: [...cur.past, cur.present].slice(-capacity), present: next, future: [] }
      }),
    [capacity],
  )
  const undo = useCallback(
    () =>
      setH((cur) =>
        cur.past.length === 0
          ? cur
          : {
              past: cur.past.slice(0, -1),
              present: cur.past[cur.past.length - 1],
              future: [cur.present, ...cur.future],
            },
      ),
    [],
  )
  const redo = useCallback(
    () =>
      setH((cur) =>
        cur.future.length === 0
          ? cur
          : { past: [...cur.past, cur.present], present: cur.future[0], future: cur.future.slice(1) },
      ),
    [],
  )
  const clear = useCallback(() => setH((cur) => ({ past: [], present: cur.present, future: [] })), [])
  const reset = useCallback(() => setH({ past: [], present: initialRef.current, future: [] }), [])

  return {
    state: h.present,
    set,
    undo,
    redo,
    clear,
    reset,
    canUndo: h.past.length > 0,
    canRedo: h.future.length > 0,
    past: h.past,
    future: h.future,
  }
}
