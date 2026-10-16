import { useState } from 'react'

/**
 * State that falls back to `defaultValue` whenever it is `null` / `undefined`.
 * @example const [name, setName] = useDefault<string | null>(null, 'Guest')
 */
export function useDefault<T>(initialValue: T | null | undefined, defaultValue: T) {
  const [state, setState] = useState<T | null | undefined>(initialValue)
  const value = state === undefined || state === null ? defaultValue : state
  return [value, setState] as const
}
