import { useCallback, useEffect } from 'react'
import { useMediaQuery } from './useMediaQuery'
import { useLocalStorage } from '../storage/useLocalStorage'

export type ColorMode = 'light' | 'dark' | 'system'

/** OS color scheme: 'light' | 'dark'. */
export function useColorScheme(): 'light' | 'dark' {
  return useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
}

export interface UseDarkModeOptions {
  storageKey?: string
  defaultMode?: ColorMode
  /** class added to <html> when dark. default 'dark' ('' to disable) */
  darkClass?: string
  /** attribute set on <html>: data-theme="dark|light". default 'data-theme' ('' to disable) */
  attribute?: string
}

/**
 * Dark mode with 3 modes (light / dark / system), saved in localStorage
 * and applied to `<html>` (class + data-theme).
 * @example const { isDark, mode, setMode, toggle } = useDarkMode()
 */
export function useDarkMode({ storageKey = 'color-mode', defaultMode = 'system', darkClass = 'dark', attribute = 'data-theme' }: UseDarkModeOptions = {}) {
  const system = useColorScheme()
  const [mode, setMode] = useLocalStorage<ColorMode>(storageKey, defaultMode)
  const resolved = mode === 'system' ? system : mode
  const isDark = resolved === 'dark'

  useEffect(() => {
    const root = document.documentElement
    if (darkClass) root.classList.toggle(darkClass, isDark)
    if (attribute) root.setAttribute(attribute, resolved)
    root.style.colorScheme = resolved
  }, [isDark, resolved, darkClass, attribute])

  const toggle = useCallback(() => setMode(isDark ? 'light' : 'dark'), [isDark, setMode])
  return { mode, resolved, isDark, setMode, toggle }
}
