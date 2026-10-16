import { useEffect } from 'react'
import { useLatest } from '../utils/useLatest'

/**
 * Detects a key SEQUENCE (e.g. the Konami code).
 * @example useKeySequence(['ArrowUp','ArrowUp','ArrowDown','ArrowDown','b','a'], () => party())
 */
export function useKeySequence(sequence: string[], onMatch: () => void, { timeout = 1500, enabled = true } = {}) {
  const cb = useLatest(onMatch)
  const id = sequence.join('|')
  useEffect(() => {
    if (!enabled) return
    const seq = id.split('|')
    let index = 0
    let timer: ReturnType<typeof setTimeout>
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      index = key === seq[index].toLowerCase() || e.key === seq[index] ? index + 1 : key === seq[0].toLowerCase() ? 1 : 0
      clearTimeout(timer)
      timer = setTimeout(() => (index = 0), timeout)
      if (index === seq.length) {
        index = 0
        cb.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [id, timeout, enabled, cb])
}
