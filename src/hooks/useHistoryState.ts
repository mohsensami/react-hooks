import { useCallback, useMemo, useReducer } from 'react'

interface HistoryData<T> {
  past: T[]
  present: T
  future: T[]
}

type Action<T> =
  | { type: 'set'; value: T; capacity: number }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'go'; steps: number }
  | { type: 'clear' }

function reducer<T>(state: HistoryData<T>, action: Action<T>): HistoryData<T> {
  switch (action.type) {
    case 'set': {
      if (Object.is(action.value, state.present)) return state
      const past = [...state.past, state.present].slice(-action.capacity)
      return { past, present: action.value, future: [] }
    }
    case 'undo': {
      if (!state.past.length) return state
      const past = state.past.slice(0, -1)
      return { past, present: state.past[state.past.length - 1], future: [state.present, ...state.future] }
    }
    case 'redo': {
      if (!state.future.length) return state
      const [next, ...future] = state.future
      return { past: [...state.past, state.present], present: next, future }
    }
    case 'go': {
      const all = [...state.past, state.present, ...state.future]
      const idx = Math.min(Math.max(state.past.length + action.steps, 0), all.length - 1)
      return { past: all.slice(0, idx), present: all[idx], future: all.slice(idx + 1) }
    }
    case 'clear':
      return { past: [], present: state.present, future: [] }
  }
}

/**
 * State with full undo / redo history.
 * @example
 * const { state, set, undo, redo, canUndo, canRedo } = useHistoryState('')
 */
export function useHistoryState<T>(initial: T, capacity = 100) {
  const [data, dispatch] = useReducer(reducer<T>, { past: [], present: initial, future: [] })
  const set = useCallback(
    (value: T | ((prev: T) => T)) =>
      dispatch({
        type: 'set',
        capacity,
        value: typeof value === 'function' ? (value as (p: T) => T)(data.present) : value,
      }),
    [capacity, data.present],
  )
  const undo = useCallback(() => dispatch({ type: 'undo' }), [])
  const redo = useCallback(() => dispatch({ type: 'redo' }), [])
  const go = useCallback((steps: number) => dispatch({ type: 'go', steps }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])
  return useMemo(
    () => ({
      state: data.present,
      set,
      undo,
      redo,
      go,
      clear,
      canUndo: data.past.length > 0,
      canRedo: data.future.length > 0,
      history: [...data.past, data.present, ...data.future],
      pointer: data.past.length,
    }),
    [data, set, undo, redo, go, clear],
  )
}
