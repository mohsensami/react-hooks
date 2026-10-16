import { useCallback, useState } from 'react'
import { isBrowser } from '../_internal'

/**
 * Read / write a CSS custom property (default target: `:root`).
 * @example const [accent, setAccent] = useCssVariable('--accent', '#6366f1')
 */
export function useCssVariable(name: string, initialValue?: string, target?: HTMLElement | null) {
  const el = () => target ?? (isBrowser ? document.documentElement : null)
  const [value, setValue] = useState<string>(() => {
    const node = el()
    if (!node) return initialValue ?? ''
    if (initialValue !== undefined) node.style.setProperty(name, initialValue)
    return getComputedStyle(node).getPropertyValue(name).trim() || (initialValue ?? '')
  })
  const set = useCallback(
    (next: string) => {
      el()?.style.setProperty(name, next)
      setValue(next)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, target],
  )
  return [value, set] as const
}
