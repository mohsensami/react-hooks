import { useState } from 'react'

/**
 * State that falls back to a default when the value is `null` / `undefined`.
 * @example
 * const [name, setName] = useDefault<string | null>(null, 'Guest') // name === 'Guest'
 */
export function useDefault<T>(initial: T | null | undefined, defaultValue: T) {
  const [value, setValue] = useState<T | null | undefined>(initial)
  return [value ?? defaultValue, setValue] as const
}
