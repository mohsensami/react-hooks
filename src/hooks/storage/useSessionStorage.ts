import { useStorage } from './useStorage'
import type { StorageOptions } from './useStorage'

/**
 * State persisted in `sessionStorage` (cleared when the tab closes).
 * @example const [draft, setDraft] = useSessionStorage('draft', '')
 */
export function useSessionStorage<T>(key: string, initialValue: T | (() => T), options?: StorageOptions<T>) {
  return useStorage<T>('session', key, initialValue, options)
}
