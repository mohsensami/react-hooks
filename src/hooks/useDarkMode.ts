import { useCallback, useEffect } from 'react';
import { useColorScheme } from './useMediaQuery';
import { useLocalStorage } from './useLocalStorage';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UseDarkModeOptions {
  /** localStorage key (default: 'theme') */
  storageKey?: string;
  /** Mode used when nothing is stored (default: 'system') */
  defaultMode?: ThemeMode;
  /** Class toggled on <html> when dark (default: 'dark') */
  className?: string;
}

export interface UseDarkModeReturn {
  /** What the user chose: 'light' | 'dark' | 'system' */
  mode: ThemeMode;
  /** What is actually applied: 'light' | 'dark' */
  resolved: 'light' | 'dark';
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  /** Switch between light and dark */
  toggle: () => void;
}

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system';

/**
 * Dark mode with `light | dark | system`, persisted in localStorage.
 * Applies the `dark` class, `data-theme` attribute and `color-scheme` to `<html>`.
 *
 * @example
 * const { isDark, mode, setMode, toggle } = useDarkMode();
 */
export function useDarkMode(options: UseDarkModeOptions = {}): UseDarkModeReturn {
  const { storageKey = 'theme', defaultMode = 'system', className = 'dark' } = options;
  const [stored, setStored] = useLocalStorage<ThemeMode>(storageKey, defaultMode);
  const system = useColorScheme();

  const mode: ThemeMode = isThemeMode(stored) ? stored : defaultMode;
  const resolved = mode === 'system' ? system : mode;
  const isDark = resolved === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(className, isDark);
    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved;
  }, [isDark, resolved, className]);

  const setMode = useCallback((next: ThemeMode) => setStored(next), [setStored]);
  const toggle = useCallback(() => setStored(isDark ? 'light' : 'dark'), [setStored, isDark]);

  return { mode, resolved, isDark, setMode, toggle };
}
