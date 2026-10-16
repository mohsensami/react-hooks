import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { resolveTarget } from './utils';

/**
 * `true` while the given key is held down.
 * Use `KeyboardEvent.key` values (`'Enter'`, `'Escape'`, `'a'`, `' '`, `'ArrowUp'` ...).
 *
 * @example
 * const isShift = useKeyPress('Shift');
 * const isEsc = useKeyPress('Escape');
 */
export function useKeyPress(
  key: string,
  target?: Document | HTMLElement | RefObject<HTMLElement | null> | null,
): boolean {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const resolved = target === undefined ? document : resolveTarget<EventTarget>(target);
    if (!resolved) return;

    const matches = (event: KeyboardEvent) => event.key.toLowerCase() === key.toLowerCase();
    const down = (event: Event) => matches(event as KeyboardEvent) && setPressed(true);
    const up = (event: Event) => matches(event as KeyboardEvent) && setPressed(false);
    const reset = () => setPressed(false);

    resolved.addEventListener('keydown', down);
    resolved.addEventListener('keyup', up);
    window.addEventListener('blur', reset);

    return () => {
      resolved.removeEventListener('keydown', down);
      resolved.removeEventListener('keyup', up);
      window.removeEventListener('blur', reset);
      setPressed(false);
    };
  }, [key, target]);

  return pressed;
}
