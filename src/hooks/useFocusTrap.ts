import { useEffect } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

export interface UseFocusTrapOptions {
  /** Trap is active (default: true) */
  enabled?: boolean;
  /** Focus the first focusable element when activated (default: true) */
  autoFocus?: boolean;
  /** Return focus to the previously focused element on deactivate (default: true) */
  restoreFocus?: boolean;
}

/**
 * Keeps keyboard focus **inside** a container (modals, dialogs, drawers).
 * Tab / Shift+Tab loop within the container.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useFocusTrap(ref, { enabled: isOpen });
 */
export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: UseFocusTrapOptions = {},
): void {
  const { enabled = true, autoFocus = true, restoreFocus = true } = options;

  useEffect(() => {
    const container = ref.current;
    if (!enabled || !container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute('hidden') && el.getClientRects().length > 0,
      );

    if (autoFocus) {
      const [first] = getFocusable();
      if (first) first.focus();
      else {
        if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');
        container.focus();
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !container.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (restoreFocus && previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [ref, enabled, autoFocus, restoreFocus]);
}
