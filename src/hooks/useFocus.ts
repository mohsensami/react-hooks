import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export interface UseFocusReturn<T extends HTMLElement> {
  ref: RefObject<T | null>;
  /** The element itself has focus */
  isFocused: boolean;
  /** The element has focus via keyboard (`:focus-visible`) */
  isFocusVisible: boolean;
  focus: () => void;
  blur: () => void;
}

/**
 * Focus state of an element + `focus()` / `blur()` helpers.
 *
 * @example
 * const { ref, isFocused, focus } = useFocus<HTMLInputElement>();
 * <input ref={ref} style={{ outline: isFocused ? '2px solid blue' : 'none' }} />
 */
export function useFocus<T extends HTMLElement = HTMLElement>(
  externalRef?: RefObject<T | null>,
): UseFocusReturn<T> {
  const internalRef = useRef<T | null>(null);
  const ref = externalRef ?? internalRef;
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onFocus = () => {
      setIsFocused(true);
      try {
        setIsFocusVisible(el.matches(':focus-visible'));
      } catch {
        setIsFocusVisible(true);
      }
    };
    const onBlur = () => {
      setIsFocused(false);
      setIsFocusVisible(false);
    };

    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
    if (document.activeElement === el) onFocus();

    return () => {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
    };
  }, [ref]);

  const focus = useCallback(() => ref.current?.focus(), [ref]);
  const blur = useCallback(() => ref.current?.blur(), [ref]);

  return { ref, isFocused, isFocusVisible, focus, blur };
}
