import { useSyncExternalStore } from 'react';

function subscribe(cb: () => void) {
  window.addEventListener('languagechange', cb);
  return () => window.removeEventListener('languagechange', cb);
}

/**
 * Browser preferred language (`navigator.language`), updates on change.
 *
 * @example
 * const lang = useLanguage(); // 'fa-IR'
 */
export function useLanguage(): string {
  return useSyncExternalStore(
    subscribe,
    () => navigator.language,
    () => 'en-US',
  );
}
