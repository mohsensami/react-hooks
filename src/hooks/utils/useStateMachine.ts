import { useCallback, useRef, useState } from 'react'
import { useLatest } from './useLatest'

export interface MachineConfig<S extends string, E extends string> {
  initial: S
  states: Record<S, { on?: Partial<Record<E, S>>; onEnter?: () => void; onExit?: () => void }>
}

/**
 * Small finite state machine.
 * @example
 * const { state, send, can } = useStateMachine({
 *   initial: 'idle',
 *   states: { idle: { on: { FETCH: 'loading' } }, loading: { on: { OK: 'idle' } } },
 * })
 */
export function useStateMachine<S extends string, E extends string>(config: MachineConfig<S, E>) {
  const configRef = useLatest(config)
  const [state, setState] = useState<S>(config.initial)
  const stateRef = useRef(state)

  const can = useCallback(
    (event: E) => Boolean(configRef.current.states[stateRef.current]?.on?.[event]),
    [configRef],
  )
  const send = useCallback(
    (event: E) => {
      const states = configRef.current.states
      const next = states[stateRef.current]?.on?.[event]
      if (!next) return false
      states[stateRef.current]?.onExit?.()
      stateRef.current = next
      setState(next)
      states[next]?.onEnter?.()
      return true
    },
    [configRef],
  )
  const reset = useCallback(() => {
    stateRef.current = configRef.current.initial
    setState(configRef.current.initial)
  }, [configRef])

  return { state, send, can, reset }
}
