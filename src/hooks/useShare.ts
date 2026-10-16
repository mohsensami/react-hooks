import { useCallback, useState } from 'react';

/**
 * Web Share API (native share sheet on mobile).
 *
 * @example
 * const { share, isSupported } = useShare();
 * share({ title: 'Hi', text: 'Look at this', url: location.href });
 */
export function useShare() {
  const [error, setError] = useState<Error | null>(null);
  const isSupported = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const share = useCallback(
    async (data: ShareData): Promise<boolean> => {
      if (!isSupported) return false;
      try {
        await navigator.share(data);
        setError(null);
        return true;
      } catch (e) {
        // user cancelling the sheet is an AbortError — not a real failure
        if (e instanceof DOMException && e.name === 'AbortError') return false;
        setError(e instanceof Error ? e : new Error(String(e)));
        return false;
      }
    },
    [isSupported],
  );

  return { share, isSupported, error };
}
