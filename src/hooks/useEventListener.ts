import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useLatest } from './useLatest';
import { resolveTarget } from './utils';

export type ListenerOptions = Pick<AddEventListenerOptions, 'capture' | 'passive' | 'once'>;

/**
 * Add a DOM event listener declaratively. The handler may change on every
 * render without re-subscribing. Cleans up automatically.
 *
 * - no target      -> `window`
 * - `document`     -> document events
 * - ref / element  -> element events (`null` / empty ref = not attached yet)
 *
 * @example
 * useEventListener('resize', () => console.log(window.innerWidth));
 * useEventListener('keydown', (e) => e.key === 'Escape' && close(), document);
 * useEventListener('click', onClick, buttonRef);
 */
export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  target?: Window,
  options?: ListenerOptions,
): void;
export function useEventListener<K extends keyof DocumentEventMap>(
  type: K,
  handler: (event: DocumentEventMap[K]) => void,
  target: Document,
  options?: ListenerOptions,
): void;
export function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLElement>(
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  target: RefObject<T | null> | T | null,
  options?: ListenerOptions,
): void;
export function useEventListener(
  type: string,
  handler: (event: Event) => void,
  target?: EventTarget | RefObject<EventTarget | null> | null,
  options?: ListenerOptions,
): void;
export function useEventListener(
  type: string,
  handler: (event: never) => void,
  target?: EventTarget | RefObject<EventTarget | null> | null,
  options: ListenerOptions = {},
): void {
  const handlerRef = useLatest(handler as (event: Event) => void);
  const { capture, passive, once } = options;

  useEffect(() => {
    const resolved = target === undefined ? window : resolveTarget(target);
    if (!resolved) return;

    const listener = (event: Event) => handlerRef.current(event);
    resolved.addEventListener(type, listener, { capture, passive, once });
    return () => resolved.removeEventListener(type, listener, { capture });
  }, [type, target, capture, passive, once, handlerRef]);
}
