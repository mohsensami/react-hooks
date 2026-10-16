import { useCallback, useEffect, useRef, useState } from 'react'
import { useLatest } from '../utils/useLatest'

export interface UseCountdownOptions {
  /** ms between ticks, default 1000 */
  interval?: number
  /** start automatically, default false */
  autoStart?: boolean
  /** how much to subtract per tick, default 1 */
  step?: number
  onComplete?: () => void
  onTick?: (count: number) => void
}

/**
 * Countdown from `initialCount` to 0.
 * @example const { count, start, pause, resume, reset, isRunning } = useCountdown(60, { autoStart: true })
 */
export function useCountdown(initialCount: number, options: UseCountdownOptions = {}) {
  const { interval = 1000, autoStart = false, step = 1 } = options
  const [count, setCount] = useState(initialCount)
  const [isRunning, setRunning] = useState(autoStart)
  const optsRef = useLatest(options)
  const countRef = useRef(initialCount)

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      countRef.current = Math.max(0, countRef.current - step)
      setCount(countRef.current)
      optsRef.current.onTick?.(countRef.current)
      if (countRef.current <= 0) {
        setRunning(false)
        optsRef.current.onComplete?.()
      }
    }, interval)
    return () => clearInterval(id)
  }, [isRunning, interval, step, optsRef])

  const start = useCallback(
    (from?: number) => {
      countRef.current = typeof from === 'number' ? from : initialCount
      setCount(countRef.current)
      setRunning(true)
    },
    [initialCount],
  )
  const pause = useCallback(() => setRunning(false), [])
  const resume = useCallback(() => countRef.current > 0 && setRunning(true), [])
  const reset = useCallback(() => {
    countRef.current = initialCount
    setCount(initialCount)
    setRunning(false)
  }, [initialCount])

  return { count, isRunning, isFinished: count <= 0, start, pause, resume, reset }
}
