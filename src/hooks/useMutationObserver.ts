import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useLatest } from './useLatest';

/**
 * Observe DOM mutations (children, attributes, text) with `MutationObserver`.
 *
 * @example
 * useMutationObserver(ref, (records) => console.log(records), { childList: true, subtree: true });
 */
export function useMutationObserver<T extends Node = HTMLElement>(
  target: RefObject<T | null> | T | null,
  callback: MutationCallback,
  options: MutationObserverInit = { attributes: true, childList: true, subtree: true },
): void {
  const callbackRef = useLatest(callback);
  const { attributes, childList, subtree, characterData, attributeOldValue, characterDataOldValue } = options;

  useEffect(() => {
    const el = target && 'current' in target ? target.current : (target as T | null);
    if (!el || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver((records, obs) => callbackRef.current(records, obs));
    observer.observe(el, { attributes, childList, subtree, characterData, attributeOldValue, characterDataOldValue });
    return () => observer.disconnect();
  }, [target, attributes, childList, subtree, characterData, attributeOldValue, characterDataOldValue, callbackRef]);
}
