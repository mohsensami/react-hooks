import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useLatest } from '../utils/useLatest'

/**
 * Runs `callback(deltaMs, timeMs)` on every animation frame.
 * @example useAnimationFrame((dt) => { angle.current += dt * 0.1 })
 */
export function useAnimationFrame(callback: (delta: number, time: number) => void, enabled = true) {
  const cbRef = useLatest(callback)
  useEffect(() => {
    if (!enabled) return
    let id = 0
    let last = performance.now()
    const loop = (t: number) => {
      cbRef.current(t - last, t)
      last = t
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [enabled, cbRef])
}

/** `useState` whose updates are batched to one per animation frame (smooth for mouse/scroll). */
export function useRafState<T>(initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const frame = useRef(0)
  const [state, setState] = useState(initial)
  const set = useCallback((value: SetStateAction<T>) => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => setState(value))
  }, [])
  useEffect(() => () => cancelAnimationFrame(frame.current), [])
  return [state, set]
}
