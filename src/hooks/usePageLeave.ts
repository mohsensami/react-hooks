import { useEventListener } from './useEventListener';

/**
 * Fires when the mouse leaves the page through the top (exit-intent popups).
 *
 * @example
 * usePageLeave(() => setShowOffer(true));
 */
export function usePageLeave(handler: () => void): void {
  useEventListener('mouseleave', (e) => {
    if (e.clientY <= 0) handler();
  }, document);
}
