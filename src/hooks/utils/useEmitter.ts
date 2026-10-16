import { useEffect } from 'react'
import { useConst } from './useConst'
import { useLatest } from './useLatest'

export interface Emitter<Events extends Record<string, unknown>> {
  on: <K extends keyof Events>(event: K, handler: (payload: Events[K]) => void) => () => void
  off: <K extends keyof Events>(event: K, handler: (payload: Events[K]) => void) => void
  emit: <K extends keyof Events>(event: K, payload: Events[K]) => void
  clear: () => void
}

/**
 * Typed pub/sub event bus.
 * @example const bus = createEmitter<{ login: { user: string } }>()
 */
export function createEmitter<Events extends Record<string, unknown>>(): Emitter<Events> {
  const map = new Map<keyof Events, Set<(payload: never) => void>>()
  return {
    on(event, handler) {
      if (!map.has(event)) map.set(event, new Set())
      map.get(event)!.add(handler as (payload: never) => void)
      return () => this.off(event, handler)
    },
    off(event, handler) {
      map.get(event)?.delete(handler as (payload: never) => void)
    },
    emit(event, payload) {
      map.get(event)?.forEach((h) => (h as (p: typeof payload) => void)(payload))
    },
    clear: () => map.clear(),
  }
}

/** Creates a component-scoped emitter (one instance per component). */
export function useEmitter<Events extends Record<string, unknown>>() {
  return useConst(() => createEmitter<Events>())
}

/** Subscribe to an emitter event for the lifetime of the component. */
export function useEmitterEvent<Events extends Record<string, unknown>, K extends keyof Events>(
  emitter: Emitter<Events>,
  event: K,
  handler: (payload: Events[K]) => void,
) {
  const ref = useLatest(handler)
  useEffect(() => emitter.on(event, (p) => ref.current(p)), [emitter, event, ref])
}
