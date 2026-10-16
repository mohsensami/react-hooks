import { useStorage } from './useStorage';
import type { UseStorageOptions, UseStorageReturn } from './useStorage';

/**
 * Same as `useLocalStorage` but uses `sessionStorage`
 * (cleared when the tab is closed, not shared between tabs).
 *
 * @example
 * const [draft, setDraft] = useSessionStorage('draft', '');
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: Omit<UseStorageOptions<T>, 'storage'> = {},
): UseStorageReturn<T> {
  return useStorage(key, initialValue, { ...options, storage: 'session' });
}
