import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useLatest } from './useLatest';

type OutsideEvent = MouseEvent | TouchEvent | PointerEvent;

export interface UseClickOutsideOptions {
  /** Events to listen to (default: ['pointerdown']) */
  events?: Array<'pointerdown' | 'mousedown' | 'mouseup' | 'click' | 'touchstart'>;
  /** Set false to disable (e.g. when the popup is closed). Default: true */
  enabled?: boolean;
  /** Extra elements that must NOT count as "outside" (e.g. the toggle button) */
  ignore?: Array<RefObject<HTMLElement | null>>;
}

/**
 * Calls `handler` when the user clicks / taps **outside** of the given element(s).
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setOpen(false), { enabled: open });
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null> | Array<RefObject<HTMLElement | null>>,
  handler: (event: OutsideEvent) => void,
  options: UseClickOutsideOptions = {},
): void {
  const { events = ['pointerdown'], enabled = true, ignore } = options;
  const handlerRef = useLatest(handler);
  const refs = Array.isArray(ref) ? ref : [ref];
  const eventsKey = events.join(',');

  useEffect(() => {
    if (!enabled) return;
    const names = eventsKey.split(',') as NonNullable<UseClickOutsideOptions['events']>;

    const listener = (event: Event) => {
      const target = event.target as Node | null;
      if (!target || !target.isConnected) return;

      const all = [...refs, ...(ignore ?? [])];
      const inside = all.some((r) => r.current?.contains(target));
      if (!inside) handlerRef.current(event as OutsideEvent);
    };

    names.forEach((name) => document.addEventListener(name, listener));
    return () => names.forEach((name) => document.removeEventListener(name, listener));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, eventsKey, handlerRef, ...refs, ...(ignore ?? [])]);
}
