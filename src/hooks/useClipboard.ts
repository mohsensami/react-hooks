import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseClipboardOptions {
  /** ms until `copied` goes back to false (default 2000) */
  timeout?: number;
}

/**
 * Copy / paste with the async Clipboard API (falls back to `execCommand` for copy).
 *
 * @example
 * const { copy, copied, paste, text } = useClipboard();
 * <button onClick={() => copy('Hello')}>{copied ? 'Copied!' : 'Copy'}</button>
 */
export function useClipboard({ timeout = 2000 }: UseClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          const area = document.createElement('textarea');
          area.value = value;
          area.style.position = 'fixed';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          const ok = document.execCommand('copy');
          area.remove();
          if (!ok) throw new Error('Copy command was rejected');
        }
        setText(value);
        setError(null);
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), timeout);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        setCopied(false);
        return false;
      }
    },
    [timeout],
  );

  const paste = useCallback(async (): Promise<string> => {
    try {
      const value = await navigator.clipboard.readText();
      setText(value);
      setError(null);
      return value;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      return '';
    }
  }, []);

  return {
    copy,
    paste,
    copied,
    text,
    error,
    isSupported: typeof navigator !== 'undefined' && !!navigator.clipboard,
  };
}
