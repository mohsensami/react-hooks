import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Stopwatch with laps. `time` is in milliseconds.
 * @example const { time, start, pause, reset, lap, laps } = useStopwatch()
 */
export function useStopwatch({ autoStart = false, updateInterval = 50 } = {}) {
  const [time, setTime] = useState(0)
  const [isRunning, setRunning] = useState(autoStart)
  const [laps, setLaps] = useState<number[]>([])
  const base = useRef(0)
  const startedAt = useRef(0)

  useEffect(() => {
    if (!isRunning) return
    startedAt.current = performance.now()
    const id = setInterval(() => setTime(base.current + performance.now() - startedAt.current), updateInterval)
    return () => {
      clearInterval(id)
      base.current += performance.now() - startedAt.current
    }
  }, [isRunning, updateInterval])

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const toggle = useCallback(() => setRunning((r) => !r), [])
  const reset = useCallback(() => {
    base.current = 0
    startedAt.current = performance.now()
    setTime(0)
    setLaps([])
  }, [])
  const lap = useCallback(() => setLaps((l) => [...l, base.current + (performance.now() - startedAt.current)]), [])

  return { time, isRunning, laps, start, pause, toggle, reset, lap }
}

/** Formats ms as `mm:ss.cc` */
export function formatStopwatch(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const c = Math.floor((ms % 1000) / 10)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(c).padStart(2, '0')}`
}
