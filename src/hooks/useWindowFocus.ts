import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('focus', callback);
  window.addEventListener('blur', callback);
  return () => {
    window.removeEventListener('focus', callback);
    window.removeEventListener('blur', callback);
  };
}

/**
 * `true` while the browser window / tab has focus.
 *
 * @example
 * const focused = useWindowFocus();
 * useDocumentTitle(focused ? 'App' : 'Come back! 👋');
 */
export function useWindowFocus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => document.hasFocus(),
    () => true,
  );
}
