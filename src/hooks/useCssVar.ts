import { useCallback, useState } from 'react';

/**
 * Read & write a CSS custom property (default target: `:root`).
 *
 * @example
 * const [primary, setPrimary] = useCssVar('--primary', '#646cff');
 * setPrimary('#ff0000');
 */
export function useCssVar(name: string, initial = '', target?: HTMLElement | null) {
  const el = () => target ?? document.documentElement;
  const [value, setValue] = useState(() =>
    typeof document === 'undefined' ? initial : getComputedStyle(el()).getPropertyValue(name).trim() || initial,
  );

  const set = useCallback(
    (next: string) => {
      el().style.setProperty(name, next);
      setValue(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, target],
  );

  return [value, set] as const;
}
