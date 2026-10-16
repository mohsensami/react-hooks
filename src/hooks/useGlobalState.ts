import { useRef, useSyncExternalStore } from 'react';

export interface Store<T> {
  getState: () => T;
  setState: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  /** Restore the initial state */
  reset: () => void;
}

/**
 * Tiny external store (no provider needed). Use together with {@link useStore}.
 *
 * @example
 * export const counterStore = createStore({ count: 0 });
 * counterStore.setState((s) => ({ count: s.count + 1 }));
 */
export function createStore<T>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (next) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;
      if (Object.is(resolved, state)) return;
      state = resolved;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    reset: () => {
      if (Object.is(state, initialState)) return;
      state = initialState;
      listeners.forEach((listener) => listener());
    },
  };
}

/**
 * Subscribe a component to a store (optionally to a slice of it).
 * The component only re-renders when the selected slice changes.
 *
 * @example
 * const count = useStore(counterStore, (s) => s.count);
 */
export function useStore<T>(store: Store<T>): T;
export function useStore<T, S>(
  store: Store<T>,
  selector: (state: T) => S,
  isEqual?: (a: S, b: S) => boolean,
): S;
export function useStore<T, S>(
  store: Store<T>,
  selector?: (state: T) => S,
  isEqual: (a: S, b: S) => boolean = Object.is,
): S | T {
  const cache = useRef<{ state: T; selector: unknown; selected: S | T } | undefined>(undefined);

  const getSnapshot = (): S | T => {
    const state = store.getState();
    const cached = cache.current;

    if (cached && Object.is(cached.state, state) && cached.selector === selector) {
      return cached.selected;
    }

    const selected = selector ? selector(state) : state;

    if (cached && selector && isEqual(cached.selected as S, selected as S)) {
      cache.current = { state, selector, selected: cached.selected };
      return cached.selected;
    }

    cache.current = { state, selector, selected };
    return selected;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

/**
 * Create a global `useState`-like hook that is shared by every component.
 *
 * @example
 * export const useTheme = createGlobalState<'light' | 'dark'>('light');
 * const [theme, setTheme] = useTheme();
 */
export function createGlobalState<T>(initialState: T) {
  const store = createStore(initialState);

  function useGlobalState(): [T, Store<T>['setState']] {
    const state = useStore(store);
    return [state, store.setState];
  }

  useGlobalState.store = store;
  return useGlobalState;
}
