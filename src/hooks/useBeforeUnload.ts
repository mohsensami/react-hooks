import { useEffect } from 'react';

/**
 * Ask the browser to confirm before the user closes / reloads the tab.
 * Pass `false` when there is nothing to lose.
 * (Browsers show their own generic text; custom messages are ignored.)
 *
 * @example
 * useBeforeUnload(form.isDirty);
 */
export function useBeforeUnload(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled]);
}
