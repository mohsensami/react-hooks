import { useEffect, useState } from 'react'

const DEFAULT_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll']

/**
 * `true` after the user did nothing for `timeout` ms.
 * @example const idle = useIdle(30_000)
 */
export function useIdle(timeout = 60000, { events = DEFAULT_EVENTS, initialState = false } = {}) {
  const [idle, setIdle] = useState(initialState)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const reset = () => {
      setIdle(false)
      clearTimeout(timer)
      timer = setTimeout(() => setIdle(true), timeout)
    }
    const onVisibility = () => {
      if (!document.hidden) reset()
    }
    reset()
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, reset))
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeout, events.join(',')])
  return idle
}
