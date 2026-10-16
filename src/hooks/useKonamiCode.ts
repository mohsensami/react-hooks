import { useEffect } from 'react';
import { useLatest } from './useLatest';

export const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const;

/**
 * Fires `onSuccess` when the user types a secret key sequence.
 * Defaults to the Konami code (↑ ↑ ↓ ↓ ← → ← → B A).
 *
 * @example
 * useKonamiCode(() => setEasterEgg(true));
 * useKonamiCode(() => alert('hi'), ['h', 'e', 'l', 'p']);
 */
export function useKonamiCode(
  onSuccess: () => void,
  sequence: readonly string[] = KONAMI_CODE,
): void {
  const callbackRef = useLatest(onSuccess);
  const sequenceKey = sequence.join('\u0000');

  useEffect(() => {
    const expected = sequenceKey.split('\u0000');
    let index = 0;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === expected[index]) {
        index += 1;
        if (index === expected.length) {
          index = 0;
          callbackRef.current();
        }
      } else {
        index = key === expected[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sequenceKey, callbackRef]);
}
