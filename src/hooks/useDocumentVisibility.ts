import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}

/**
 * Page Visibility API: `'visible'` while the tab is in the foreground,
 * `'hidden'` when the user switched tabs / minimized the window.
 *
 * @example
 * const visibility = useDocumentVisibility();
 * useInterval(refresh, visibility === 'visible' ? 5000 : null);
 */
export function useDocumentVisibility(): DocumentVisibilityState {
  return useSyncExternalStore(
    subscribe,
    () => document.visibilityState,
    () => 'visible' as DocumentVisibilityState,
  );
}
