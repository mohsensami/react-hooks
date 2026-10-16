import { useStorage } from './useStorage'
import type { StorageOptions } from './useStorage'

/**
 * State persisted in `localStorage` (synced across tabs & components).
 * @example const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light')
 */
export function useLocalStorage<T>(key: string, initialValue: T | (() => T), options?: StorageOptions<T>) {
  return useStorage<T>('local', key, initialValue, options)
}
