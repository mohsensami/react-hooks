import { useStorage } from './useStorage';
import type { UseStorageOptions, UseStorageReturn } from './useStorage';

/**
 * `useState` persisted in `localStorage`.
 * - JSON serialization (objects, arrays, numbers, booleans ...)
 * - synced between components and between browser tabs
 * - safe on SSR / when storage is blocked
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 * setTheme('dark');
 * setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: Omit<UseStorageOptions<T>, 'storage'> = {},
): UseStorageReturn<T> {
  return useStorage(key, initialValue, { ...options, storage: 'local' });
}
