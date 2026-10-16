import { useEffect, useRef } from 'react';
import { useLatest } from './useLatest';

export class EventEmitter<T = void> {
  private listeners = new Set<(payload: T) => void>();
  emit = (payload: T) => this.listeners.forEach((l) => l(payload));
  subscribe = (listener: (payload: T) => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
}

/**
 * Tiny pub/sub to talk between distant components (pass the emitter via props/context).
 *
 * @example
 * const bus = useEventEmitter<string>();
 * bus.emit('hello');
 * // in another component:
 * bus.useSubscription((msg) => console.log(msg));
 */
export function useEventEmitter<T = void>() {
  const ref = useRef<EventEmitter<T> | null>(null);
  if (!ref.current) ref.current = new EventEmitter<T>();
  const emitter = ref.current;

  return {
    emit: emitter.emit,
    subscribe: emitter.subscribe,
    /** a hook — call it at the top level of a component */
    useSubscription(listener: (payload: T) => void) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const latest = useLatest(listener);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => emitter.subscribe((p) => latest.current(p)), [latest]);
    },
  };
}
