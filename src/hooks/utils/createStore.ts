import { useRef, useSyncExternalStore } from 'react'

export interface Store<T extends object> {
  getState: () => T
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void
  subscribe: (listener: (state: T, prev: T) => void) => () => void
  reset: () => void
}

/**
 * Tiny global store (zustand-like) – works outside React too.
 * @example
 * const counterStore = createStore({ count: 0 })
 * const count = useStore(counterStore, s => s.count)
 * counterStore.setState(s => ({ count: s.count + 1 }))
 */
export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial
  const listeners = new Set<(state: T, prev: T) => void>()
  return {
    getState: () => state,
    setState: (partial) => {
      const patch = typeof partial === 'function' ? partial(state) : partial
      const prev = state
      const next = { ...state, ...patch }
      if (Object.is(next, prev)) return
      state = next
      listeners.forEach((l) => l(state, prev))
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    reset: () => {
      const prev = state
      state = initial
      listeners.forEach((l) => l(state, prev))
    },
  }
}

/** Subscribe a component to (a slice of) a store. */
export function useStore<T extends object, S = T>(
  store: Store<T>,
  selector: (state: T) => S = (s) => s as unknown as S,
  isEqual: (a: S, b: S) => boolean = Object.is,
): S {
  const last = useRef<{ state: T; selected: S } | null>(null)
  const getSnapshot = () => {
    const state = store.getState()
    if (last.current && last.current.state === state) return last.current.selected
    const selected = selector(state)
    if (last.current && isEqual(last.current.selected, selected)) {
      last.current.state = state
      return last.current.selected
    }
    last.current = { state, selected }
    return selected
  }
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot)
}
