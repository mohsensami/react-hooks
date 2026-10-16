import { useState } from 'react'
import { useInterval } from './useInterval'

/**
 * Current `Date`, refreshed every `interval` ms (null = never).
 * @example const now = useNow(1000); now.toLocaleTimeString()
 */
export function useNow(interval: number | null = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useInterval(() => setNow(new Date()), interval)
  return now
}
