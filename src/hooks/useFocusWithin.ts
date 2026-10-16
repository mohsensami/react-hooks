import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

/**
 * `true` when the element **or any of its descendants** has focus
 * (like CSS `:focus-within`). Great for highlighting a whole form field group.
 *
 * @example
 * const [ref, hasFocus] = useFocusWithin<HTMLFieldSetElement>();
 * <fieldset ref={ref} className={hasFocus ? 'active' : ''}>...</fieldset>
 */
export function useFocusWithin<T extends HTMLElement = HTMLElement>(
  externalRef?: RefObject<T | null>,
): [ref: RefObject<T | null>, isFocusWithin: boolean] {
  const internalRef = useRef<T | null>(null);
  const ref = externalRef ?? internalRef;
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onFocusIn = () => setIsFocusWithin(true);
    const onFocusOut = (event: FocusEvent) => {
      if (!el.contains(event.relatedTarget as Node | null)) setIsFocusWithin(false);
    };

    el.addEventListener('focusin', onFocusIn);
    el.addEventListener('focusout', onFocusOut);
    return () => {
      el.removeEventListener('focusin', onFocusIn);
      el.removeEventListener('focusout', onFocusOut);
    };
  }, [ref]);

  return [ref, isFocusWithin];
}
